from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List
from app.schemas.plant import Plant
from app.schemas.analysis import PanelZone, AnalysisSummary
from app.schemas.maintenance_action import MaintenanceAction

class InspectionBase(BaseModel):
    title: str
    rows: int = 4
    cols: int = 6

class InspectionCreate(InspectionBase):
    plant_id: int

class Inspection(InspectionBase):
    id: int
    plant_id: int
    rgb_image_path: str
    thermal_image_path: Optional[str] = None
    generation_csv_path: Optional[str] = None
    weather_json_path: Optional[str] = None
    status: str
    created_at: datetime
    analyzed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class InspectionDetail(BaseModel):
    inspection: Inspection
    plant: Plant
    image_url: str
    thermal_image_url: Optional[str] = None
    zones: List[PanelZone]
    actions: List[MaintenanceAction]
    summary: Optional[AnalysisSummary] = None

    model_config = ConfigDict(from_attributes=True)
