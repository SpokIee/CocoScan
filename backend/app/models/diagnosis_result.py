from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class DiagnosisResult(Base):
    __tablename__ = "diagnosis_results"

    id: Mapped[int] = mapped_column(primary_key=True)
    image_id: Mapped[int] = mapped_column(ForeignKey("leaf_images.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    # healthy | gray_leaf_spot | leaf_rot | uncertain | not_configured
    predicted_class: Mapped[str] = mapped_column(String(32), nullable=False)
    # Highest class probability, 0..1. Null when the model is not configured.
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    # JSON-encoded per-class probabilities for transparency.
    probabilities_json: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    model_name: Mapped[str] = mapped_column(String(64), nullable=False)
    model_version: Mapped[str] = mapped_column(String(64), default="unknown")
    is_simulated: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_saved: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    image = relationship("LeafImage", back_populates="result")
    user = relationship("User", back_populates="results")
    updates = relationship("ScanUpdate", back_populates="result", cascade="all, delete-orphan")
