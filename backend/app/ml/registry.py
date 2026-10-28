"""Model discovery and loading.

Expected layout (relative to MODEL_DIR, default `backend/models_store/`):

    models_store/
      mobilenetv3/
        MobileNetV3.keras      (any single *.keras / *.h5 / *.tflite, or model.* / saved_model/)
        model_config.json      (committed; see docs/MODEL_INTEGRATION.md)
      efficientnetb0/
        ...
      resnet50/
        ...

The team's Colab notebook saves `MobileNetV3.keras`, `EfficientNetB0.keras`
and `ResNet50.keras`; those names are accepted as-is, no renaming needed.
Switching the deployed architecture only requires changing ACTIVE_MODEL in
.env — the mobile app never needs to change.
"""
from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Protocol

import numpy as np

from app.core.config import get_settings
from app.ml.labels import CLASS_NAMES
from app.ml.preprocessing import DEFAULT_SPECS, PreprocessSpec

log = logging.getLogger(__name__)

WEIGHT_CANDIDATES = ("model.keras", "model.h5", "saved_model", "model.tflite")
WEIGHT_GLOBS = ("*.keras", "*.h5", "*.tflite")


class ClassifierModel(Protocol):
    """Mirrors the `ClassifierModel` interface in the manuscript's class diagram."""

    name: str
    version: str
    spec: PreprocessSpec

    def predict(self, batch: np.ndarray) -> np.ndarray:
        """Return class probabilities of shape (num_classes,) for a batch of 1."""
        ...


@dataclass
class LoadedKerasModel:
    name: str
    version: str
    spec: PreprocessSpec
    _model: object

    def predict(self, batch: np.ndarray) -> np.ndarray:
        out = self._model.predict(batch, verbose=0)  # type: ignore[attr-defined]
        return _to_probabilities(np.asarray(out)[0])


@dataclass
class LoadedTFLiteModel:
    name: str
    version: str
    spec: PreprocessSpec
    _interpreter: object

    def predict(self, batch: np.ndarray) -> np.ndarray:
        interp = self._interpreter
        inp = interp.get_input_details()[0]  # type: ignore[attr-defined]
        outp = interp.get_output_details()[0]  # type: ignore[attr-defined]
        data = batch.astype(inp["dtype"])
        interp.set_tensor(inp["index"], data)  # type: ignore[attr-defined]
        interp.invoke()  # type: ignore[attr-defined]
        out = interp.get_tensor(outp["index"])  # type: ignore[attr-defined]
        return _to_probabilities(np.asarray(out)[0])


def _to_probabilities(vec: np.ndarray) -> np.ndarray:
    vec = vec.astype(np.float64)
    # If the model's last layer is logits (not softmax), normalize here.
    if vec.min() < 0 or not np.isclose(vec.sum(), 1.0, atol=1e-2):
        e = np.exp(vec - vec.max())
        vec = e / e.sum()
    return vec


@dataclass
class RegistryStatus:
    configured: bool
    detail: str
    weights_path: Path | None = None


class ModelRegistry:
    def __init__(self) -> None:
        self._model: ClassifierModel | None = None
        self._status = RegistryStatus(configured=False, detail="Not loaded yet.")
        self._attempted = False

    # ----------------------------------------------------------------- public
    @property
    def status(self) -> RegistryStatus:
        if not self._attempted:
            self.load()
        return self._status

    @property
    def model(self) -> ClassifierModel | None:
        if not self._attempted:
            self.load()
        return self._model

    @property
    def spec(self) -> PreprocessSpec:
        if self._model:
            return self._model.spec
        return self._resolve_spec()

    def class_names(self) -> list[str]:
        spec = self.spec
        return spec.class_names or CLASS_NAMES

    def load(self) -> None:
        """Try to load the active model. Never raises — records status instead."""
        self._attempted = True
        settings = get_settings()
        model_dir = settings.model_path / settings.active_model
        weights = _find_weights(model_dir)
        if weights is None:
            self._status = RegistryStatus(
                configured=False,
                detail=(
                    f"No trained weights found for '{settings.active_model}'. "
                    f"Copy the notebook's .keras file (e.g. MobileNetV3.keras) into {model_dir}."
                ),
            )
            return

        spec = self._resolve_spec()
        version = _read_version(model_dir)
        try:
            if weights.name.endswith(".tflite"):
                self._model = _load_tflite(weights, settings.active_model, version, spec)
            else:
                self._model = _load_keras(weights, settings.active_model, version, spec)
            self._status = RegistryStatus(configured=True, detail=f"Loaded {weights.name}", weights_path=weights)
            log.info("Loaded %s model from %s", settings.active_model, weights)
        except Exception as exc:  # pragma: no cover - depends on local runtime
            self._model = None
            self._status = RegistryStatus(
                configured=False,
                detail=f"Weights found at {weights} but loading failed: {exc}",
                weights_path=weights,
            )
            log.exception("Failed to load model")

    # ---------------------------------------------------------------- private
    def _resolve_spec(self) -> PreprocessSpec:
        settings = get_settings()
        base = DEFAULT_SPECS[settings.active_model]
        cfg = settings.model_path / settings.active_model / "model_config.json"
        if cfg.exists():
            try:
                data = json.loads(cfg.read_text(encoding="utf-8"))
                return PreprocessSpec.from_dict(base, data)
            except (OSError, ValueError, KeyError) as exc:
                log.warning("Invalid model_config.json (%s); using defaults", exc)
        return base


def _find_weights(model_dir: Path) -> Path | None:
    if not model_dir.exists():
        return None
    for candidate in WEIGHT_CANDIDATES:
        p = model_dir / candidate
        if p.exists():
            return p
    # Fall back to whatever single weights file was dropped in (the Colab
    # notebook names them after the architecture, e.g. MobileNetV3.keras).
    for pattern in WEIGHT_GLOBS:
        matches = sorted(p for p in model_dir.glob(pattern) if p.is_file())
        if len(matches) > 1:
            log.warning("Several %s files in %s; using %s", pattern, model_dir, matches[0].name)
        if matches:
            return matches[0]
    return None


def _read_version(model_dir: Path) -> str:
    cfg = model_dir / "model_config.json"
    if cfg.exists():
        try:
            return str(json.loads(cfg.read_text(encoding="utf-8")).get("version", "unknown"))
        except (OSError, ValueError):
            pass
    return "unknown"


def _load_keras(path: Path, name: str, version: str, spec: PreprocessSpec) -> ClassifierModel:
    try:
        import tensorflow as tf  # noqa: WPS433 (optional heavy dependency)
    except ImportError as exc:
        raise RuntimeError("tensorflow is not installed. Add it to requirements.txt and pip install.") from exc
    model = tf.keras.models.load_model(str(path), compile=False)
    return LoadedKerasModel(name=name, version=version, spec=spec, _model=model)


def _load_tflite(path: Path, name: str, version: str, spec: PreprocessSpec) -> ClassifierModel:
    interpreter = None
    try:
        from tflite_runtime.interpreter import Interpreter  # type: ignore

        interpreter = Interpreter(model_path=str(path))
    except ImportError:
        try:
            import tensorflow as tf

            interpreter = tf.lite.Interpreter(model_path=str(path))
        except ImportError as exc:
            raise RuntimeError("Neither tflite-runtime nor tensorflow is installed.") from exc
    interpreter.allocate_tensors()
    return LoadedTFLiteModel(name=name, version=version, spec=spec, _interpreter=interpreter)


registry = ModelRegistry()
