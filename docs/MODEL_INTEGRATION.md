# Plugging in the trained CNN

The backend is architecture-agnostic: switching between MobileNetV3, EfficientNetB0 and
ResNet50 is a `.env` change. The mobile app never changes.

The team's training notebook is `ACTUAL MODEL.ipynb` (Colab). Everything below is derived
from that notebook, so the committed `model_config.json` files already match it. If the
notebook changes (different folder names, a `Rescaling` layer, a different input size),
update the matching `model_config.json`.

## 0. What the notebook does (and what the backend therefore does)

| Notebook | Backend equivalent |
| --- | --- |
| `flow_from_directory` on folders `Gray_Leaf_Spot`, `Leaf_Healthy`, `Leaf_Rot` → sorted alphabetically | `class_names: ["gray_leaf_spot", "healthy", "leaf_rot"]` |
| `target_size=(224, 224)` with default `interpolation='nearest'` (stretch, no crop) | `input_size: [224, 224]`, `resize_mode: "stretch"`, `interpolation: "nearest"` |
| MobileNetV3Large `include_preprocessing=True`, plain `ImageDataGenerator()` → raw 0–255 | `normalization: "none"` |
| EfficientNetB0 (normalizes internally), plain `ImageDataGenerator()` → raw 0–255 | `normalization: "none"` |
| ResNet50 with `preprocessing_function=resnet_preprocess` | `normalization: "caffe"` (RGB→BGR + ImageNet mean) |
| `Dense(3, activation='softmax')` | probabilities used directly; argmax = prediction |
| Saved as `MyDrive/coconut_models/{MobileNetV3,EfficientNetB0,ResNet50}.keras` | drop those files in unchanged |

## 1. Get the files out of Colab

The notebook already copies each model to Google Drive at
`MyDrive/coconut_models/<Name>.keras`. Either download them from Drive in the browser, or
add this cell at the end of the notebook and run it (works in a fresh runtime too, as long as
Drive is mounted):

```python
# --- CocoScan export: zips the three .keras files + their configs for the backend ---
import os, json, shutil
from google.colab import files

SRC = '/content/drive/MyDrive/coconut_models'
OUT = '/content/cocoscan_models'
shutil.rmtree(OUT, ignore_errors=True)

ARCHS = {  # notebook name -> backend folder, normalization
    'MobileNetV3':    ('mobilenetv3',    'none'),
    'EfficientNetB0': ('efficientnetb0', 'none'),
    'ResNet50':       ('resnet50',       'caffe'),
}
# Must equal the order printed as "Class label order" in the generators cell.
CLASS_NAMES = ['gray_leaf_spot', 'healthy', 'leaf_rot']

for name, (folder, norm) in ARCHS.items():
    src = f'{SRC}/{name}.keras'
    if not os.path.exists(src):
        print(f'skip {name}: {src} not found'); continue
    dst = f'{OUT}/{folder}'
    os.makedirs(dst, exist_ok=True)
    shutil.copy(src, f'{dst}/{name}.keras')
    json.dump({
        'version': f'{name}-colab-v1',
        'source_file': f'{name}.keras',
        'input_size': [224, 224],
        'normalization': norm,
        'resize_mode': 'stretch',
        'interpolation': 'nearest',
        'channels_last': True,
        'class_names': CLASS_NAMES,
    }, open(f'{dst}/model_config.json', 'w'), indent=2)
    print(f'{name}: {os.path.getsize(src)/1e6:.1f} MB')

print('TensorFlow used for training:', __import__('tensorflow').__version__)
shutil.make_archive('/content/cocoscan_models', 'zip', OUT)
files.download('/content/cocoscan_models.zip')
```

Note the printed TensorFlow version. Install the same minor version on the PC (step 3).

## 2. Put them in the backend

Unzip `cocoscan_models.zip` into `backend/models_store/` so you end up with:

```
backend/models_store/
  mobilenetv3/
    MobileNetV3.keras
    model_config.json
  efficientnetb0/
    EfficientNetB0.keras
    model_config.json
  resnet50/
    ResNet50.keras
    model_config.json
```

The `model_config.json` files are already committed in the repo with these exact values, so
copying just the three `.keras` files is enough. Weights are git-ignored and never pushed.

Then in `backend/.env` (copy from `.env.example` if it does not exist yet):

```
ACTIVE_MODEL=mobilenetv3          # mobilenetv3 | efficientnetb0 | resnet50
CONFIDENCE_THRESHOLD=0.70         # below this -> "uncertain"
```

## 3. Install the runtime and start the API

Needs Python 3.11 or 3.12 (TensorFlow has no Windows wheels for newer versions yet).
From `backend/`:

```bash
python -m venv .venv
```

```bash
.venv\Scripts\activate
```

```bash
pip install -r requirements.txt -r requirements-ml.txt
```

If the notebook printed, say, `2.19.0`, prefer `pip install "tensorflow==2.19.*"` so the
`.keras` files deserialize with the same Keras version that wrote them.

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

The first request after startup takes a few seconds while the model loads.

## 4. Verify

```bash
curl http://localhost:8000/scans/model-status
```

Expected: `"status": "ok"`, `"active_model": "mobilenetv3"`, `"model_version": "MobileNetV3-colab-v1"`.
If it says `not_configured`, the `detail` field explains what is missing.

Then point the phone at it: in `mobile/.env` set

```
EXPO_PUBLIC_DATA_MODE=api
EXPO_PUBLIC_API_URL=http://<your PC's LAN IP>:8000
```

restart `npx expo start`, and scan a known gray-leaf-spot image from the test split. The
per-class probabilities are returned in `probabilities` and drawn as bars on the Result screen,
so you can compare them with `model.predict` on the same file in the notebook.

## 5. `model_config.json` reference

| Field | Meaning |
| --- | --- |
| `version` | Free text shown in the API and the app (e.g. `MobileNetV3-colab-v1`). |
| `input_size` | `[height, width]` the network was trained on. |
| `normalization` | `none` (model has Rescaling/preprocessing layers inside), `scale01` (x/255), `tf` (x/127.5−1), `torch` (ImageNet mean/std), `caffe` (BGR + mean subtraction). **Must match training.** |
| `resize_mode` | `stretch` (what `flow_from_directory` does) or `center_crop`. |
| `interpolation` | `nearest` (Keras generator default), `bilinear` or `bicubic`. |
| `class_names` | Output index order. `flow_from_directory` sorts folder names alphabetically. |

If the file is missing, the defaults in `app/ml/preprocessing.py` are used and the class order
falls back to `app/ml/labels.py`.

## 6. Expected input / output contract

- **Input:** one RGB image, batch shape `(1, H, W, 3)` float32 after the preprocessing above.
- **Output:** vector of length 3. Softmax probabilities are expected; raw logits are detected
  and soft-maxed automatically.
- The predicted class is `argmax`; `confidence` is the max probability. If it is below
  `CONFIDENCE_THRESHOLD` the API returns `predicted_class: "uncertain"` (manuscript alt-flow).

## 7. Things the classifier does NOT do

- **Leaf presence.** A 3-class CNN will always answer one of its 3 classes, even for a photo of
  a wall. `app/ml/validation.py` only checks exposure/detail. Add a binary leaf/not-leaf model
  or an OOD score there if the research wants the "no leaf detected → retake" step from the
  activity diagram.
- **Bounding boxes.** The Figma result frame shows red rectangles; a classifier has no spatial
  output. The app shows the plain photo. Grad-CAM heat-maps could be added later via a new
  response field without changing the screen flow.
