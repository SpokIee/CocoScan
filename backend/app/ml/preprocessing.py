"""Image preprocessing per CNN architecture.

Each architecture has a default `PreprocessSpec`. A `model_config.json`
placed next to the trained weights can override any field so the backend
matches exactly what was done during training.

Normalization modes
-------------------
- "none"     : keep 0..255 floats (use when the saved Keras model already
               contains Rescaling / preprocessing layers — true for the
               stock `keras.applications` MobileNetV3 and EfficientNetB0).
- "scale01"  : x / 255
- "tf"       : x / 127.5 - 1            (range -1..1)
- "torch"    : (x/255 - mean) / std      (ImageNet mean/std, RGB)
- "caffe"    : BGR, subtract ImageNet mean (what `resnet50.preprocess_input` does)
"""
from __future__ import annotations

from dataclasses import dataclass, field
from io import BytesIO
from typing import Literal

import numpy as np
from PIL import Image, ImageOps

NormalizationMode = Literal["none", "scale01", "tf", "torch", "caffe"]

IMAGENET_MEAN_RGB = np.array([0.485, 0.456, 0.406], dtype=np.float32)
IMAGENET_STD_RGB = np.array([0.229, 0.224, 0.225], dtype=np.float32)
CAFFE_MEAN_BGR = np.array([103.939, 116.779, 123.68], dtype=np.float32)


@dataclass
class PreprocessSpec:
    input_size: tuple[int, int] = (224, 224)  # (height, width)
    normalization: NormalizationMode = "none"
    channels_last: bool = True
    resize_mode: Literal["stretch", "center_crop"] = "center_crop"
    class_names: list[str] = field(default_factory=list)

    @classmethod
    def from_dict(cls, base: "PreprocessSpec", data: dict) -> "PreprocessSpec":
        size = data.get("input_size", list(base.input_size))
        return cls(
            input_size=(int(size[0]), int(size[1])),
            normalization=data.get("normalization", base.normalization),
            channels_last=bool(data.get("channels_last", base.channels_last)),
            resize_mode=data.get("resize_mode", base.resize_mode),
            class_names=list(data.get("class_names", base.class_names)),
        )


DEFAULT_SPECS: dict[str, PreprocessSpec] = {
    # keras.applications.MobileNetV3* include rescaling layers -> "none"
    "mobilenetv3": PreprocessSpec(input_size=(224, 224), normalization="none"),
    # keras.applications.EfficientNetB0 includes normalization -> "none"
    "efficientnetb0": PreprocessSpec(input_size=(224, 224), normalization="none"),
    # keras.applications.ResNet50 expects caffe-style preprocessing
    "resnet50": PreprocessSpec(input_size=(224, 224), normalization="caffe"),
}


def load_image(data: bytes) -> Image.Image:
    img = Image.open(BytesIO(data))
    img = ImageOps.exif_transpose(img)  # respect phone orientation metadata
    return img.convert("RGB")


def resize(img: Image.Image, spec: PreprocessSpec) -> Image.Image:
    h, w = spec.input_size
    if spec.resize_mode == "center_crop":
        return ImageOps.fit(img, (w, h), method=Image.Resampling.BILINEAR)
    return img.resize((w, h), Image.Resampling.BILINEAR)


def normalize(arr: np.ndarray, mode: NormalizationMode) -> np.ndarray:
    arr = arr.astype(np.float32)
    if mode == "none":
        return arr
    if mode == "scale01":
        return arr / 255.0
    if mode == "tf":
        return arr / 127.5 - 1.0
    if mode == "torch":
        return (arr / 255.0 - IMAGENET_MEAN_RGB) / IMAGENET_STD_RGB
    if mode == "caffe":
        bgr = arr[..., ::-1]
        return bgr - CAFFE_MEAN_BGR
    raise ValueError(f"Unknown normalization mode: {mode}")


def preprocess(data: bytes, spec: PreprocessSpec) -> np.ndarray:
    """Bytes -> batch tensor of shape (1, H, W, 3) (or (1, 3, H, W))."""
    img = resize(load_image(data), spec)
    arr = normalize(np.asarray(img), spec.normalization)
    if not spec.channels_last:
        arr = np.transpose(arr, (2, 0, 1))
    return np.expand_dims(arr, axis=0)
