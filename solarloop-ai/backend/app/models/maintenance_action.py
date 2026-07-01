from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class MaintenanceAction(Base):
    __tablename__ = "maintenance_actions"

    id = Column(Integer, primary_key=True, index=True)
    inspection_id = Column(Integer, ForeignKey("inspections.id"), nullable=False)
    zone_code = Column(String, nullable=False)
    action_type = Column(String, nullable=False)  # REPAIR_REVIEW, INSPECTION_REQUIRED, WAIT_FOR_RAIN, CLEANING_PRIORITY, NORMAL_MONITORING
    priority_rank = Column(Integer, nullable=False)
    expected_recovery_kwh = Column(Float, nullable=True)
    reason = Column(String, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    inspection = relationship("Inspection", back_populates="actions")
