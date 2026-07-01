from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class PanelZone(Base):
    __tablename__ = "panel_zones"

    id = Column(Integer, primary_key=True, index=True)
    inspection_id = Column(Integer, ForeignKey("inspections.id"), nullable=False)
    zone_code = Column(String, nullable=False)  # e.g., A-01, B-02
    row_index = Column(Integer, nullable=False)
    col_index = Column(Integer, nullable=False)
    x = Column(Float, nullable=False)
    y = Column(Float, nullable=False)
    width = Column(Float, nullable=False)
    height = Column(Float, nullable=False)
    soiling_score = Column(Float, default=0.0, nullable=False)
    shading_score = Column(Float, default=0.0, nullable=False)
    thermal_score = Column(Float, default=0.0, nullable=False)
    damage_score = Column(Float, default=0.0, nullable=False)
    generation_loss_score = Column(Float, default=0.0, nullable=False)
    priority_score = Column(Float, default=0.0, nullable=False)
    status_label = Column(String, default="NORMAL", nullable=False)  # NORMAL, SOILING, SHADING, THERMAL_ANOMALY, PHYSICAL_DAMAGE_SUSPECTED, GENERATION_LOSS_SUSPECTED
    recommendation_label = Column(String, default="NORMAL_MONITORING", nullable=False)  # NORMAL_MONITORING, CLEANING_PRIORITY, INSPECTION_REQUIRED, WAIT_FOR_RAIN, REPAIR_REVIEW
    explanation = Column(String, nullable=True)

    inspection = relationship("Inspection", back_populates="zones")
