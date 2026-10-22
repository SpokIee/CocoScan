import json

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.ml.labels import label_for
from app.ml.predictor import InferenceOutcome, run_inference
from app.ml.validation import validate_upload
from app.models import DiagnosisResult, LeafImage, ScanUpdate, User
from app.schemas.scan import ScanResultOut
from app.services import storage_service


class ScanError(Exception):
    def __init__(self, message: str, status_code: int = 400) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def image_url_for(result: DiagnosisResult) -> str:
    return f"/scans/{result.id}/image"


def to_out(result: DiagnosisResult, outcome: InferenceOutcome | None = None, warnings: list[str] | None = None) -> ScanResultOut:
    probabilities = None
    if result.probabilities_json:
        try:
            probabilities = json.loads(result.probabilities_json)
        except ValueError:
            probabilities = None
    status = "ok"
    if outcome is not None:
        status = outcome.status
    elif result.predicted_class == "not_configured":
        status = "not_configured"
    return ScanResultOut(
        id=result.id,
        image_id=result.image_id,
        predicted_class=result.predicted_class,  # type: ignore[arg-type]
        label=label_for(result.predicted_class),
        confidence=result.confidence,
        probabilities=probabilities,
        model_name=result.model_name,
        model_version=result.model_version,
        model_status=status,  # type: ignore[arg-type]
        is_simulated=result.is_simulated,
        is_saved=result.is_saved,
        created_at=result.created_at,
        image_url=image_url_for(result),
        warnings=warnings or (outcome.warnings if outcome else []),
        message=outcome.message if outcome else None,
    )


def analyze(db: Session, user: User, data: bytes, content_type: str | None) -> ScanResultOut:
    settings = get_settings()
    validation = validate_upload(data, content_type, settings.max_upload_mb * 1024 * 1024)
    if not validation.ok:
        raise ScanError(validation.error or "Invalid image.", status_code=422)

    storage_path = storage_service.save_image(user.id, data, content_type)
    image = LeafImage(user_id=user.id, storage_path=storage_path, content_type=content_type or "image/jpeg")
    db.add(image)
    db.flush()

    outcome = run_inference(data)
    outcome.warnings = validation.warnings + outcome.warnings

    result = DiagnosisResult(
        image_id=image.id,
        user_id=user.id,
        predicted_class=outcome.predicted_class,
        confidence=outcome.confidence,
        probabilities_json=json.dumps(outcome.probabilities) if outcome.probabilities else None,
        model_name=outcome.model_name,
        model_version=outcome.model_version,
        is_simulated=False,
        is_saved=False,
    )
    db.add(result)
    db.flush()

    if outcome.status == "ok":
        db.add(
            ScanUpdate(
                user_id=user.id,
                result_id=result.id,
                status="scan_complete",
                title="Scan complete!",
            )
        )
    db.commit()
    db.refresh(result)
    return to_out(result, outcome)


def get_owned_result(db: Session, user: User, result_id: int) -> DiagnosisResult:
    result = db.get(DiagnosisResult, result_id)
    if result is None or result.user_id != user.id:
        raise ScanError("Scan not found.", status_code=404)
    return result


def save(db: Session, user: User, result_id: int) -> ScanResultOut:
    result = get_owned_result(db, user, result_id)
    if result.predicted_class == "not_configured":
        raise ScanError("This scan has no prediction to save (model not configured).", status_code=409)
    if not result.is_saved:  # idempotent: pressing Save twice does nothing extra
        result.is_saved = True
        db.add(ScanUpdate(user_id=user.id, result_id=result.id, status="result_saved", title="Result saved"))
        db.commit()
        db.refresh(result)
    return to_out(result)


def history(db: Session, user: User) -> list[ScanResultOut]:
    rows = db.scalars(
        select(DiagnosisResult)
        .where(DiagnosisResult.user_id == user.id, DiagnosisResult.is_saved.is_(True))
        .order_by(DiagnosisResult.created_at.desc(), DiagnosisResult.id.desc())
    ).all()
    return [to_out(r) for r in rows]
