from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models import DiseaseInfo
from app.schemas.disease import DiseaseOut

router = APIRouter(prefix="/diseases", tags=["diseases"])


def _to_out(d: DiseaseInfo) -> DiseaseOut:
    return DiseaseOut(
        id=d.id,
        key=d.key,
        name=d.name,
        scientific_name=d.scientific_name,
        description=d.description,
        symptoms=[s for s in d.symptoms.split("\n") if s.strip()],
        management=[m for m in d.management.split("\n") if m.strip()],
    )


@router.get("", response_model=list[DiseaseOut])
def list_diseases(db: Session = Depends(get_db)) -> list[DiseaseOut]:
    rows = db.scalars(select(DiseaseInfo).order_by(DiseaseInfo.id)).all()
    return [_to_out(d) for d in rows]


@router.get("/{key}", response_model=DiseaseOut)
def get_disease(key: str, db: Session = Depends(get_db)) -> DiseaseOut:
    d = db.scalar(select(DiseaseInfo).where(DiseaseInfo.key == key))
    if d is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Disease not found.")
    return _to_out(d)
