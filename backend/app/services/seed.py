"""Seed the disease information library.

Content is limited to what the CocoScan manuscript supports: symptom
descriptions for gray leaf spot and leaf rot and general, non-chemical
management guidance. No specific pesticide recommendations are included.
"""
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import DiseaseInfo

DISEASES = [
    {
        "key": "healthy",
        "name": "Healthy Coconut Leaf",
        "scientific_name": None,
        "description": (
            "A healthy coconut leaflet is uniformly green with a smooth surface and firm texture. "
            "Natural aging of older fronds can cause gradual yellowing from the tip, which is not a disease. "
            "Use healthy leaves as a visual baseline when comparing suspicious spots or discoloration."
        ),
        "symptoms": "\n".join(
            [
                "Uniform green color across the leaflet",
                "No spots, lesions, or dark borders",
                "Firm, intact leaf tissue without soft or wet areas",
            ]
        ),
        "management": "\n".join(
            [
                "Continue regular inspection of young and mature fronds",
                "Keep records of scans so changes can be spotted early",
            ]
        ),
    },
    {
        "key": "gray_leaf_spot",
        "name": "Gray Leaf Spot",
        "scientific_name": "Pestalotiopsis palmarum",
        "description": (
            "Gray leaf spot is a fungal disease that begins as small, faint yellow-brown spots on the coconut leaflets, "
            "often resembling normal leaf aging or nutrient deficiency at first glance. As the disease progresses, "
            "the spots enlarge and merge together, developing grayish centers with darker brown or reddish borders. "
            "The affected leaf tissue eventually dries out, turns brittle, and dies. In advanced stages, large sections "
            "of the frond can appear scorched, reducing the leaf's ability to photosynthesize and weakening the overall "
            "health of the palm. The disease tends to spread more quickly in warm, humid conditions with poor air circulation."
        ),
        "symptoms": "\n".join(
            [
                "Small faint yellow-brown spots on leaflets, easy to mistake for aging",
                "Spots enlarge and merge, forming grayish centers with dark brown or reddish borders",
                "Affected tissue dries, turns brittle, and dies",
                "Large scorched-looking sections of the frond in advanced stages",
            ]
        ),
        "management": "\n".join(
            [
                "Inspect leaves regularly so early spots are caught before they spread",
                "Remove and dispose of severely affected fronds away from the plantation",
                "Improve air circulation and avoid conditions that keep fronds wet for long periods",
                "Maintain balanced palm nutrition; stressed palms are more susceptible",
                "Consult an agricultural technician before applying any treatment",
            ]
        ),
    },
    {
        "key": "leaf_rot",
        "name": "Leaf Rot",
        "scientific_name": "Coconut Leaf Rot Disease Complex (LRDC)",
        "description": (
            "Leaf rot is a disease that typically starts at the tip or edges of the coconut leaflet, appearing as "
            "subtle water-soaked or discolored patches. As it advances, the affected tissue softens and darkens, turning "
            "brown to black as decay spreads inward toward the midrib. In severe cases, the rot can produce a distinct "
            "foul odor and cause entire leaflets to collapse and wither. Leaf rot progresses fastest during periods of "
            "heavy rainfall or prolonged moisture, and can significantly weaken young or already-stressed palms if left untreated."
        ),
        "symptoms": "\n".join(
            [
                "Water-soaked or discolored patches starting at the leaflet tip or edges",
                "Tissue softens and darkens, turning brown to black",
                "Decay spreads inward toward the midrib",
                "Foul odor and collapsing, withering leaflets in severe cases",
            ]
        ),
        "management": "\n".join(
            [
                "Check palms more frequently during and after heavy rainfall",
                "Remove rotted leaflet portions and dispose of them away from healthy palms",
                "Reduce prolonged leaf wetness where possible",
                "Pay special attention to young or stressed palms, which are more vulnerable",
                "Consult an agricultural technician before applying any treatment",
            ]
        ),
    },
]


def seed_diseases(db: Session) -> None:
    for item in DISEASES:
        existing = db.scalar(select(DiseaseInfo).where(DiseaseInfo.key == item["key"]))
        if existing is None:
            db.add(DiseaseInfo(**item))
    db.commit()
