# models_store

Drop the trained weights from the team's Colab notebook (`ACTUAL MODEL.ipynb`) here.
The notebook saves them to Google Drive as `MyDrive/coconut_models/*.keras`:

```
models_store/
  mobilenetv3/
    model_config.json      (committed — already matches the notebook)
    MobileNetV3.keras      (copy from Drive; any *.keras / *.h5 / *.tflite name works)
  efficientnetb0/
    model_config.json
    EfficientNetB0.keras
  resnet50/
    model_config.json
    ResNet50.keras
```

Weights are git-ignored (they are 10–100 MB each). Only `model_config.json` is committed.
Pick the deployed architecture with `ACTIVE_MODEL=` in `backend/.env`.
See `docs/MODEL_INTEGRATION.md` for the full walkthrough.
