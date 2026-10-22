"""Local-disk image storage. Swap for S3/GCS by re-implementing save/open."""
from __future__ import annotations

import uuid
from pathlib import Path

from app.core.config import get_settings

EXT_BY_TYPE = {"image/jpeg": ".jpg", "image/jpg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/heic": ".heic"}


def save_image(user_id: int, data: bytes, content_type: str | None) -> str:
    """Persist bytes and return a storage path relative to UPLOAD_DIR."""
    settings = get_settings()
    ext = EXT_BY_TYPE.get((content_type or "").lower(), ".jpg")
    rel = Path(str(user_id)) / f"{uuid.uuid4().hex}{ext}"
    target = settings.upload_path / rel
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(data)
    return rel.as_posix()


def resolve_path(storage_path: str) -> Path:
    settings = get_settings()
    path = (settings.upload_path / storage_path).resolve()
    if settings.upload_path.resolve() not in path.parents:
        raise FileNotFoundError(storage_path)
    return path
