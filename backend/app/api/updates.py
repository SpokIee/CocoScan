from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.session import get_db
from app.ml.labels import label_for
from app.models import ScanUpdate, User
from app.schemas.update import UpdateOut
from app.services.scan_service import image_url_for

router = APIRouter(prefix="/updates", tags=["updates"])


def _to_out(u: ScanUpdate) -> UpdateOut:
    return UpdateOut(
        id=u.id,
        result_id=u.result_id,
        status=u.status,
        title=u.title,
        predicted_class=u.result.predicted_class,
        label=label_for(u.result.predicted_class),
        confidence=u.result.confidence,
        image_url=image_url_for(u.result),
        is_read=u.is_read,
        created_at=u.created_at,
    )


@router.get("", response_model=list[UpdateOut])
def list_updates(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[UpdateOut]:
    rows = db.scalars(
        select(ScanUpdate).where(ScanUpdate.user_id == user.id).order_by(ScanUpdate.created_at.desc(), ScanUpdate.id.desc())
    ).all()
    return [_to_out(u) for u in rows]


@router.post("/{update_id}/read", response_model=UpdateOut)
def mark_read(update_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> UpdateOut:
    u = db.get(ScanUpdate, update_id)
    if u is None or u.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Update not found.")
    u.is_read = True
    db.commit()
    db.refresh(u)
    return _to_out(u)
