from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional

class PlantBase(BaseModel):
    name: str
    location_name: str
    latitude: float
    longitude: float
    plant_type: str = Field(..., description="rooftop, ground, factory_roof, public_building")
    capacity_kw: float
    owner_name: Optional[str] = None

class PlantCreate(PlantBase):
    pass

class Plant(PlantBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
