from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class MaintenanceActionBase(BaseModel):
    zone_code: str
    action_type: str
    priority_rank: int
    expected_recovery_kwh: Optional[float] = None
    reason: str

class MaintenanceActionCreate(MaintenanceActionBase):
    pass

class MaintenanceAction(MaintenanceActionBase):
    id: int
    inspection_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
