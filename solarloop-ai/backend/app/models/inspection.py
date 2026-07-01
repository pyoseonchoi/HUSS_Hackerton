from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True, index=True)
    plant_id = Column(Integer, ForeignKey("plants.id"), nullable=False)
    title = Column(String, nullable=False)
    rgb_image_path = Column(String, nullable=False)
    thermal_image_path = Column(String, nullable=True)
    generation_csv_path = Column(String, nullable=True)
    weather_json_path = Column(String, nullable=True)
    rows = Column(Integer, default=4, nullable=False)
    cols = Column(Integer, default=6, nullable=False)
    status = Column(String, default="uploaded", nullable=False)  # uploaded, analyzed, failed
    created_at = Column(DateTime, default=func.now(), nullable=False)
    analyzed_at = Column(DateTime, nullable=True)

    plant = relationship("Plant", back_populates="inspections")
    zones = relationship("PanelZone", back_populates="inspection", cascade="all, delete-orphan")
    actions = relationship("MaintenanceAction", back_populates="inspection", cascade="all, delete-orphan")
