"""Inference entry point used by the scans API.

Pipeline (mirrors the manuscript's activity diagram):
  validate upload -> preprocess for the active architecture -> CNN inference
  -> argmax + confidence -> apply uncertainty threshold -> result.

No prediction is ever fabricated: when weights are missing the outcome is
`status="not_configured"` and the API says so explicitly.
"""
from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np

from app.core.config import get_settings
from app.ml.preprocessing import preprocess
from app.ml.registry import registry


@dataclass
class InferenceOutcome:
    status: str  # ok | not_configured | error
    predicted_class: str  # healthy | gray_leaf_spot | leaf_rot | uncertain | not_configured
    confidence: float | None
    probabilities: dict[str, float] | None
    model_name: str
    model_version: str
    message: str | None = None
    warnings: list[str] = field(default_factory=list)


def run_inference(image_bytes: bytes) -> InferenceOutcome:
    settings = get_settings()
    model = registry.model
    if model is None:
        return InferenceOutcome(
            status="not_configured",
            predicted_class="not_configured",
            confidence=None,
            probabilities=None,
            model_name=settings.active_model,
            model_version="unknown",
            message=registry.status.detail,
        )

    class_names = registry.class_names()
    try:
        batch = preprocess(image_bytes, model.spec)
        probs = model.predict(batch)
    except Exception as exc:  # pragma: no cover - runtime dependent
        return InferenceOutcome(
            status="error",
            predicted_class="not_configured",
            confidence=None,
            probabilities=None,
            model_name=model.name,
            model_version=model.version,
            message=f"Inference failed: {exc}",
        )

    if len(probs) != len(class_names):
        return InferenceOutcome(
            status="error",
            predicted_class="not_configured",
            confidence=None,
            probabilities=None,
            model_name=model.name,
            model_version=model.version,
            message=(
                f"Model produced {len(probs)} outputs but {len(class_names)} class names are configured. "
                "Fix class_names in model_config.json."
            ),
        )

    idx = int(np.argmax(probs))
    confidence = float(probs[idx])
    predicted = class_names[idx]
    if confidence < settings.confidence_threshold:
        predicted = "uncertain"

    return InferenceOutcome(
        status="ok",
        predicted_class=predicted,
        confidence=confidence,
        probabilities={name: round(float(p), 6) for name, p in zip(class_names, probs)},
        model_name=model.name,
        model_version=model.version,
        message=None
        if predicted != "uncertain"
        else "The model's confidence is below the configured threshold. Please capture a clearer image.",
    )
