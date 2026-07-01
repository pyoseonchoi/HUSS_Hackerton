from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.plant import Plant as PlantModel
from app.models.inspection import Inspection as InspectionModel
from app.models.panel_zone import PanelZone as PanelZoneModel
from app.models.maintenance_action import MaintenanceAction as MaintenanceActionModel
from app.schemas.inspection import Inspection, InspectionDetail
from app.schemas.analysis import AnalysisSummary
from app.services.image_storage import ImageStorageService
from app.services.panel_grid_service import PanelGridService

router = APIRouter(prefix="/api/inspections", tags=["Inspections"])

@router.post("", response_model=Inspection, status_code=status.HTTP_201_CREATED)
async def create_inspection(
    plant_id: int = Form(...),
    title: str = Form(...),
    rows: int = Form(4),
    cols: int = Form(6),
    rgb_image: UploadFile = File(...),
    thermal_image: Optional[UploadFile] = File(None),
    generation_csv: Optional[UploadFile] = File(None),
    weather_json: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    # Validate Plant exists
    plant = db.query(PlantModel).filter(PlantModel.id == plant_id).first()
    if not plant:
        raise HTTPException(status_code=400, detail="유효하지 않은 발전소 ID입니다.")
        
    try:
        # Save uploads
        rgb_path = await ImageStorageService.save_file(rgb_image, subfolder="rgb")
        
        thermal_path = None
        if thermal_image and thermal_image.filename:
            thermal_path = await ImageStorageService.save_file(thermal_image, subfolder="thermal")
            
        csv_path = None
        if generation_csv and generation_csv.filename:
            csv_path = await ImageStorageService.save_file(generation_csv, subfolder="csv")
            
        json_path = None
        if weather_json and weather_json.filename:
            json_path = await ImageStorageService.save_file(weather_json, subfolder="json")
            
        # Create inspection record
        inspection = InspectionModel(
            plant_id=plant_id,
            title=title,
            rgb_image_path=rgb_path,
            thermal_image_path=thermal_path,
            generation_csv_path=csv_path,
            weather_json_path=json_path,
            rows=rows,
            cols=cols,
            status="uploaded"
        )
        db.add(inspection)
        db.commit()
        db.refresh(inspection)
        
        # Build initial coordinate grid
        PanelGridService.create_initial_grid(db, inspection)
        
        return inspection
        
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"점검 생성 중 서버 오류 발생: {str(e)}")

@router.get("", response_model=List[Inspection])
def list_inspections(plant_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(InspectionModel)
    if plant_id is not None:
        query = query.filter(InspectionModel.plant_id == plant_id)
    return query.order_by(InspectionModel.created_at.desc()).all()

@router.get("/{inspection_id}", response_model=InspectionDetail)
def get_inspection_detail(inspection_id: int, request: Request, db: Session = Depends(get_db)):
    inspection = db.query(InspectionModel).filter(InspectionModel.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="점검 내역을 찾을 수 없습니다.")
        
    plant = db.query(PlantModel).filter(PlantModel.id == inspection.plant_id).first()
    zones = db.query(PanelZoneModel).filter(PanelZoneModel.inspection_id == inspection_id).all()
    actions = db.query(MaintenanceActionModel).filter(MaintenanceActionModel.inspection_id == inspection_id).order_by(MaintenanceActionModel.priority_rank.asc()).all()
    
    # Construct base URLs
    base_url = str(request.base_url)
    image_url = ImageStorageService.get_full_url(inspection.rgb_image_path, base_url)
    thermal_image_url = ImageStorageService.get_full_url(inspection.thermal_image_path, base_url) if inspection.thermal_image_path else None
    
    # Calculate summary if analyzed
    summary = None
    if inspection.status == "analyzed" and zones:
        total = len(zones)
        normal = sum(1 for z in zones if z.recommendation_label == "NORMAL_MONITORING")
        cleaning = sum(1 for z in zones if z.recommendation_label == "CLEANING_PRIORITY")
        inspections = sum(1 for z in zones if z.recommendation_label == "INSPECTION_REQUIRED")
        rain = sum(1 for z in zones if z.recommendation_label == "WAIT_FOR_RAIN")
        repair = sum(1 for z in zones if z.recommendation_label == "REPAIR_REVIEW")
        avg_priority = float(sum(z.priority_score for z in zones) / total) if total > 0 else 0.0
        
        summary = AnalysisSummary(
            total_zones=total,
            normal_count=normal,
            cleaning_priority_count=cleaning,
            inspection_required_count=inspections,
            wait_for_rain_count=rain,
            repair_review_count=repair,
            average_priority_score=round(avg_priority, 1)
        )
        
    return {
        "inspection": inspection,
        "plant": plant,
        "image_url": image_url,
        "thermal_image_url": thermal_image_url,
        "zones": zones,
        "actions": actions,
        "summary": summary
    }
