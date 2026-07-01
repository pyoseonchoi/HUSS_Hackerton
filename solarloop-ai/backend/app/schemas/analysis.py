from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from app.schemas.maintenance_action import MaintenanceAction

class PanelZoneBase(BaseModel):
    zone_code: str
    row_index: int
    col_index: int
    x: float
    y: float
    width: float
    height: float
    soiling_score: float
    shading_score: float
    thermal_score: float
    damage_score: float
    generation_loss_score: float
    priority_score: float
    status_label: str
    recommendation_label: str
    explanation: Optional[str] = None

class PanelZoneCreate(PanelZoneBase):
    pass

class PanelZone(PanelZoneBase):
    id: int
    inspection_id: int

    model_config = ConfigDict(from_attributes=True)

class AnalysisSummary(BaseModel):
    total_zones: int
    normal_count: int
    cleaning_priority_count: int
    inspection_required_count: int
    wait_for_rain_count: int
    repair_review_count: int
    average_priority_score: float

class AnalysisResponse(BaseModel):
    inspection_id: int
    status: str
    summary: AnalysisSummary
    top_actions: List[MaintenanceAction]
