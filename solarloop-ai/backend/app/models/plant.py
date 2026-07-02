from sqlalchemy import Column, Integer, String, Float, DateTime, func
from sqlalchemy.orm import relationship
from app.core.database import Base
from typing import Optional

class Plant(Base):
    __tablename__ = "plants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location_name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    plant_type = Column(String, nullable=False)  # rooftop, ground, factory_roof, public_building
    capacity_kw = Column(Float, nullable=False)
    owner_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    inspections = relationship("Inspection", back_populates="plant", cascade="all, delete-orphan")

    @property
    def latest_inspection_id(self) -> Optional[int]:
        if self.inspections:
            # Sort by id descending to find the latest
            sorted_ins = sorted(self.inspections, key=lambda x: x.id, reverse=True)
            return sorted_ins[0].id
        return None
