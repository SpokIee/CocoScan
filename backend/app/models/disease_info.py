from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class DiseaseInfo(Base):
    __tablename__ = "disease_info"

    id: Mapped[int] = mapped_column(primary_key=True)
    # Matches DiagnosisResult.predicted_class
    key: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    scientific_name: Mapped[str | None] = mapped_column(String(160), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    # Newline-separated bullet lists
    symptoms: Mapped[str] = mapped_column(Text, nullable=False)
    management: Mapped[str] = mapped_column(Text, nullable=False)
