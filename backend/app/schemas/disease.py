from pydantic import BaseModel


class DiseaseOut(BaseModel):
    id: int
    key: str
    name: str
    scientific_name: str | None
    description: str
    symptoms: list[str]
    management: list[str]
