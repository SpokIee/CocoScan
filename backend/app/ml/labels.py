"""Class labels shared by the ML module, the API and the seed data.

The order of CLASS_NAMES must match the output index order of the trained
model. If your training notebook used a different order (e.g. Keras
`flow_from_directory` sorts folder names alphabetically), set `class_names`
in the model's `model_config.json` instead of editing this file.
"""

CLASS_NAMES: list[str] = ["healthy", "gray_leaf_spot", "leaf_rot"]

DISPLAY_LABELS: dict[str, str] = {
    "healthy": "Healthy Leaf Detected",
    "gray_leaf_spot": "Gray Leaf Spot Detected",
    "leaf_rot": "Leaf Rot Detected",
    "uncertain": "Uncertain Result",
    "not_configured": "Model Not Configured",
}


def label_for(predicted_class: str) -> str:
    return DISPLAY_LABELS.get(predicted_class, predicted_class.replace("_", " ").title())
