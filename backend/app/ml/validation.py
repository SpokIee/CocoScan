"""Upload validation and basic image-quality checks.

IMPORTANT: these checks verify that the file is a readable, reasonably
exposed photograph. They do NOT detect whether a coconut leaf is present.
Leaf presence detection requires a separate model (e.g. a binary
leaf / not-leaf classifier or an out-of-distribution detector). Until one is
provided, the API only reports quality warnings and the mobile app relies on
the framing guide and the confidence threshold.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from io import BytesIO

import numpy as np
from PIL import Image, UnidentifiedImageError

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic"}
MIN_SIDE_PX = 96
MAX_SIDE_PX = 8000


@dataclass
class ValidationResult:
    ok: bool
    error: str | None = None
    warnings: list[str] = field(default_factory=list)
    width: int = 0
    height: int = 0


def validate_upload(data: bytes, content_type: str | None, max_bytes: int) -> ValidationResult:
    if not data:
        return ValidationResult(ok=False, error="Empty upload.")
    if len(data) > max_bytes:
        return ValidationResult(ok=False, error=f"Image exceeds the {max_bytes // (1024 * 1024)} MB limit.")
    if content_type and content_type.lower() not in ALLOWED_CONTENT_TYPES:
        return ValidationResult(ok=False, error=f"Unsupported file type: {content_type}.")

    try:
        img = Image.open(BytesIO(data))
        img.verify()
        img = Image.open(BytesIO(data)).convert("RGB")
    except (UnidentifiedImageError, OSError):
        return ValidationResult(ok=False, error="The file is not a readable image.")

    w, h = img.size
    if min(w, h) < MIN_SIDE_PX:
        return ValidationResult(ok=False, error="Image is too small to analyze.", width=w, height=h)
    if max(w, h) > MAX_SIDE_PX:
        return ValidationResult(ok=False, error="Image dimensions are too large.", width=w, height=h)

    warnings = quality_warnings(img)
    return ValidationResult(ok=True, warnings=warnings, width=w, height=h)


def quality_warnings(img: Image.Image) -> list[str]:
    """Cheap exposure / blankness heuristics. Advisory only."""
    small = img.resize((128, 128))
    gray = np.asarray(small.convert("L"), dtype=np.float32)
    mean = float(gray.mean())
    std = float(gray.std())

    warnings: list[str] = []
    if mean < 40:
        warnings.append("The photo looks very dark. Try better lighting.")
    elif mean > 225:
        warnings.append("The photo looks over-exposed. Avoid direct glare.")
    if std < 12:
        warnings.append("The photo has very little detail. Make sure the leaf fills the frame.")
    return warnings
