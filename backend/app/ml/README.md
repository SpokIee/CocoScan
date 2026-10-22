# CocoScan ML module

| File | Purpose |
| --- | --- |
| `labels.py` | Class order and display labels (`healthy`, `gray_leaf_spot`, `leaf_rot`). |
| `preprocessing.py` | Per-architecture resize + normalization specs, overridable by `model_config.json`. |
| `validation.py` | Upload validation and exposure / detail warnings (not leaf detection). |
| `registry.py` | Finds and loads the active model (`.keras`, `.h5`, SavedModel, `.tflite`). |
| `predictor.py` | Runs validate → preprocess → predict → threshold. |

See `docs/MODEL_INTEGRATION.md` at the repository root for the full hand-off checklist.
