from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

PredictedClass = Literal["healthy", "gray_leaf_spot", "leaf_rot", "uncertain", "not_configured"]
ModelStatus = Literal["ok", "not_configured", "error"]


class ScanResultOut(BaseModel):
    id: int
    image_id: int
    predicted_class: PredictedClass
    label: str
    confidence: float | None = Field(default=None, description="0..1, highest class probability")
    probabilities: dict[str, float] | None = None
    model_name: str
    model_version: str
    model_status: ModelStatus
    is_simulated: bool
    is_saved: bool
    created_at: datetime
    image_url: str
    warnings: list[str] = []
    message: str | None = None


class SaveScanRequest(BaseModel):
    result_id: int


class ModelStatusOut(BaseModel):
    status: ModelStatus
    active_model: str
    model_version: str | None
    input_size: list[int] | None
    class_names: list[str]
    confidence_threshold: float
    detail: str
