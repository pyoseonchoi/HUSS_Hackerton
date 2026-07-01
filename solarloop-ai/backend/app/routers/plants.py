from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.plant import Plant as PlantModel
from app.schemas.plant import Plant, PlantCreate

router = APIRouter(prefix="/api/plants", tags=["Plants"])

@router.post("", response_model=Plant, status_code=status.HTTP_201_CREATED)
def create_plant(plant_in: PlantCreate, db: Session = Depends(get_db)):
    db_plant = PlantModel(
        name=plant_in.name,
        location_name=plant_in.location_name,
        latitude=plant_in.latitude,
        longitude=plant_in.longitude,
        plant_type=plant_in.plant_type,
        capacity_kw=plant_in.capacity_kw,
        owner_name=plant_in.owner_name
    )
    db.add(db_plant)
    db.commit()
    db.refresh(db_plant)
    return db_plant

@router.get("", response_model=List[Plant])
def list_plants(db: Session = Depends(get_db)):
    return db.query(PlantModel).order_by(PlantModel.created_at.desc()).all()

@router.get("/{plant_id}", response_model=Plant)
def get_plant(plant_id: int, db: Session = Depends(get_db)):
    plant = db.query(PlantModel).filter(PlantModel.id == plant_id).first()
    if not plant:
        raise HTTPException(status_code=404, detail="발전소를 찾을 수 없습니다.")
    return plant
