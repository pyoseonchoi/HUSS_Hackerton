from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.plant import Plant as PlantModel
from app.models.inspection import Inspection as InspectionModel
from app.models.panel_zone import PanelZone as PanelZoneModel

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("")
def get_dashboard_summary(db: Session = Depends(get_db)):
    """
    Retrieves system-wide overview statistics and recent inspection activities.
    """
    total_plants = db.query(PlantModel).count()
    total_inspections = db.query(InspectionModel).count()
    analyzed_inspections = db.query(InspectionModel).filter(InspectionModel.status == "analyzed").count()
    
    # High risk zones defined as priority_score >= 70
    high_risk_zones_count = db.query(PanelZoneModel).filter(
        PanelZoneModel.priority_score >= 70.0
    ).count()
    
    # Retrieve the 5 most recent inspections, joined with their plants
    recent_db_inspections = db.query(InspectionModel).order_by(
        InspectionModel.created_at.desc()
    ).limit(5).all()
    
    recent_inspections = []
    for ins in recent_db_inspections:
        plant = db.query(PlantModel).filter(PlantModel.id == ins.plant_id).first()
        recent_inspections.append({
            "id": ins.id,
            "plant_id": ins.plant_id,
            "plant_name": plant.name if plant else "알 수 없는 발전소",
            "title": ins.title,
            "status": ins.status,
            "created_at": ins.created_at
        })
        
    return {
        "total_plants": total_plants,
        "total_inspections": total_inspections,
        "analyzed_inspections": analyzed_inspections,
        "high_risk_zones_count": high_risk_zones_count,
        "recent_inspections": recent_inspections
    }
