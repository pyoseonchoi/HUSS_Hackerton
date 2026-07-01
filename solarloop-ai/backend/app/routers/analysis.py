from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.analysis import AnalysisResponse
from app.services.analysis_service import AnalysisService
from app.services.demo_seeding_service import DemoSeedingService

router = APIRouter(tags=["Analysis"])

@router.post("/api/inspections/{inspection_id}/analyze", response_model=AnalysisResponse)
def analyze_inspection(inspection_id: int, db: Session = Depends(get_db)):
    """
    Executes diagnostic rules engine on the specified inspection files.
    """
    try:
        result = AnalysisService.run_analysis(db, inspection_id)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except FileNotFoundError as fnfe:
        raise HTTPException(status_code=404, detail=str(fnfe))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"분석 중 오류 발생: {str(e)}")

@router.post("/api/demo/seed", status_code=status.HTTP_201_CREATED)
def seed_demo(db: Session = Depends(get_db)):
    """
    Generates mockup assets (Pillow drawings, CSVs, JSONs) and inserts
    initial records to allow instant preview on the frontend.
    """
    try:
        inspection_id = DemoSeedingService.seed_demo_data(db)
        return {
            "status": "success",
            "message": "데모 데이터가 성공적으로 생성되었습니다.",
            "inspection_id": inspection_id
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"데모 데이터 생성 중 오류 발생: {str(e)}")
