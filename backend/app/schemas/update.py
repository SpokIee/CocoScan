from datetime import datetime

from pydantic import BaseModel


class UpdateOut(BaseModel):
    id: int
    result_id: int
    status: str
    title: str
    predicted_class: str
    label: str
    confidence: float | None
    image_url: str
    is_read: bool
    created_at: datetime
