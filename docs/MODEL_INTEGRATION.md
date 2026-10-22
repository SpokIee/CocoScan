# Plugging in the trained CNN

The backend is architecture-agnostic: switching between MobileNetV3, EfficientNetB0 and
ResNet50 is a `.env` change. The mobile app never changes.

## 1. Files to provide

```
backend/models_store/
  mobilenetv3/
    model.keras            # or model.h5, or a saved_model/ folder, or model.tflite
    model_config.json      # optional but strongly recommended
  efficientnetb0/
    ...
  resnet50/
    ...
```

Then in `backend/.env`:

```
ACTIVE_MODEL=mobilenetv3          # mobilenetv3 | efficientnetb0 | resnet50
CONFIDENCE_THRESHOLD=0.70         # below this -> "uncertain"
```

and install the runtime:

```
pip install tensorflow==2.16.1    # for .keras / .h5 / SavedModel
# or, for .tflite only:
pip install tflite-runtime
```

Restart uvicorn. `GET /health` and `GET /scans/model-status` report whether the model loaded.

## 2. `model_config.json`

```json
{
  "version": "mnv3-large-v1.2",
  "input_size": [224, 224],
  "normalization": "none",
  "resize_mode": "center_crop",
  "channels_last": true,
  "class_names": ["gray_leaf_spot", "healthy", "leaf_rot"]
}
```

| Field | Meaning |
| --- | --- |
| `input_size` | `[height, width]` the network was trained on. |
| `normalization` | `none` (model has Rescaling/preprocessing layers inside — default for `keras.applications` MobileNetV3 & EfficientNetB0), `scale01` (x/255), `tf` (x/127.5−1), `torch` (ImageNet mean/std), `caffe` (BGR + mean subtraction — default for ResNet50). **Must match training.** |
| `resize_mode` | `center_crop` (keeps aspect) or `stretch`. |
| `class_names` | Output index order. Keras `image_dataset_from_directory` sorts folders alphabetically, so it is usually `["gray_leaf_spot","healthy","leaf_rot"]` if the folders had those names. Check `train_ds.class_names` in the notebook. |

If the file is missing, the defaults in `app/ml/preprocessing.py` are used and class order is
`["healthy", "gray_leaf_spot", "leaf_rot"]`.

## 3. Expected input / output contract

- **Input:** one RGB image, batch shape `(1, H, W, 3)` float32 after the preprocessing above.
- **Output:** vector of length 3. Softmax probabilities are expected; raw logits are detected
  and soft-maxed automatically.
- The predicted class is `argmax`; `confidence` is the max probability. If it is below
  `CONFIDENCE_THRESHOLD` the API returns `predicted_class: "uncertain"` (manuscript alt-flow).

## 4. Verify

```bash
curl http://localhost:8000/scans/model-status
# {"status":"ok","active_model":"mobilenetv3","model_version":"mnv3-large-v1.2", ...}
```

Then scan a known gray-leaf-spot image from the test split through the app and compare
with the notebook's prediction for the same file. Per-class probabilities are returned in
`probabilities` and shown as bars on the Result screen for transparency.

## 5. Things the classifier does NOT do

- **Leaf presence.** A 3-class CNN will always answer one of its 3 classes, even for a photo of
  a wall. `app/ml/validation.py` only checks exposure/detail. Add a binary leaf/not-leaf model
  or an OOD score there if the research wants the "no leaf detected → retake" step from the
  activity diagram.
- **Bounding boxes.** The Figma result frame shows red rectangles; a classifier has no spatial
  output. The app shows the plain photo. Grad-CAM heat-maps could be added later via a new
  response field without changing the screen flow.
