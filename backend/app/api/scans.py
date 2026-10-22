from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.database.session import get_db
from app.ml.registry import registry
from app.models import User
from app.schemas.scan import ModelStatusOut, SaveScanRequest, ScanResultOut
from app.services import scan_service, storage_service
from app.services.scan_service import ScanError

router = APIRouter(prefix="/scans", tags=["scans"])


@router.get("/model-status", response_model=ModelStatusOut)
def model_status() -> ModelStatusOut:
    settings = get_settings()
    st = registry.status
    spec = registry.spec
    return ModelStatusOut(
        status="ok" if st.configured else "not_configured",
        active_model=settings.active_model,
        model_version=registry.model.version if registry.model else None,
        input_size=list(spec.input_size),
        class_names=registry.class_names(),
        confidence_threshold=settings.confidence_threshold,
        detail=st.detail,
    )


@router.post("/analyze", response_model=ScanResultOut, status_code=status.HTTP_201_CREATED)
async def analyze(
    image: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ScanResultOut:
    data = await image.read()
    try:
        return scan_service.analyze(db, user, data, image.content_type)
    except ScanError as exc:
        raise HTTPException(exc.status_code, detail=exc.message) from exc


@router.post("/save", response_model=ScanResultOut)
def save(body: SaveScanRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> ScanResultOut:
    try:
        return scan_service.save(db, user, body.result_id)
    except ScanError as exc:
        raise HTTPException(exc.status_code, detail=exc.message) from exc


@router.get("/history", response_model=list[ScanResultOut])
def history(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[ScanResultOut]:
    return scan_service.history(db, user)


@router.get("/{result_id}", response_model=ScanResultOut)
def get_scan(result_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> ScanResultOut:
    try:
        return scan_service.to_out(scan_service.get_owned_result(db, user, result_id))
    except ScanError as exc:
        raise HTTPException(exc.status_code, detail=exc.message) from exc


@router.get("/{result_id}/image")
def get_scan_image(result_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> FileResponse:
    try:
        result = scan_service.get_owned_result(db, user, result_id)
        path = storage_service.resolve_path(result.image.storage_path)
    except (ScanError, FileNotFoundError) as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Image not found.") from exc
    if not path.exists():
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Image file missing.")
    return FileResponse(path, media_type=result.image.content_type)
