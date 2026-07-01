import os
from datetime import datetime
from PIL import Image
from sqlalchemy.orm import Session
from app.models.inspection import Inspection
from app.models.plant import Plant
from app.models.panel_zone import PanelZone
from app.analyzers.rule_based import RuleBasedAnalyzer
from app.services.weather_service import WeatherService
from app.services.generation_loss_service import GenerationLossService
from app.services.recommendation_service import RecommendationService

class AnalysisService:
    @staticmethod
    def run_analysis(db: Session, inspection_id: int) -> dict:
        """
        Runs rules-based analysis on the uploaded images and metadata files.
        Calculates individual zone scores and executes recommendation engine.
        """
        # 1. Load Inspection and Plant
        inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
        if not inspection:
            raise ValueError("해당 점검 내역을 찾을 수 없습니다.")
            
        plant = db.query(Plant).filter(Plant.id == inspection.plant_id).first()
        if not plant:
            raise ValueError("연관된 발전소 정보를 찾을 수 없습니다.")
            
        # Update state to processing (though SQLite is fast, standard flow)
        zones = db.query(PanelZone).filter(PanelZone.inspection_id == inspection.id).all()
        if not zones:
            raise ValueError("점검 구역 정보가 생성되지 않았습니다.")
            
        # 2. Open Images
        rgb_img_path = os.path.join("app", inspection.rgb_image_path)
        if not os.path.exists(rgb_img_path):
            raise FileNotFoundError(f"RGB 이미지를 찾을 수 없습니다: {rgb_img_path}")
            
        rgb_image = Image.open(rgb_img_path)
        rgb_w, rgb_h = rgb_image.size
        
        thermal_image = None
        overall_thermal_mean = 128.0
        if inspection.thermal_image_path:
            thermal_img_path = os.path.join("app", inspection.thermal_image_path)
            if os.path.exists(thermal_img_path):
                thermal_image = Image.open(thermal_img_path)
                # Calculate overall thermal mean for calibration
                gray_thermal = thermal_image.convert("L")
                import numpy as np
                overall_thermal_mean = float(np.mean(np.array(gray_thermal)))
                
        # 3. Read weather & generation logs
        weather_data = WeatherService.get_weather_data(inspection.weather_json_path)
        rain_expected = weather_data.get("rain_expected_within_24h", False)
        
        loss_data = GenerationLossService.calculate_generation_loss(inspection.generation_csv_path)
        global_loss = loss_data.get("global", 0.0)
        
        # 4. Crop and Analyze each zone
        analyzer = RuleBasedAnalyzer()
        
        for zone in zones:
            # Crop RGB cell
            left = int(zone.x * rgb_w)
            top = int(zone.y * rgb_h)
            right = int((zone.x + zone.width) * rgb_w)
            bottom = int((zone.y + zone.height) * rgb_h)
            
            # Ensure correct coordinate bounds
            left = max(0, min(left, rgb_w - 1))
            top = max(0, min(top, rgb_h - 1))
            right = max(left + 1, min(right, rgb_w))
            bottom = max(top + 1, min(bottom, rgb_h))
            
            rgb_crop = rgb_image.crop((left, top, right, bottom))
            
            # Crop Thermal cell if exists
            thermal_crop = None
            if thermal_image:
                t_w, t_h = thermal_image.size
                t_left = int(zone.x * t_w)
                t_top = int(zone.y * t_h)
                t_right = int((zone.x + zone.width) * t_w)
                t_bottom = int((zone.y + zone.height) * t_h)
                
                t_left = max(0, min(t_left, t_w - 1))
                t_top = max(0, min(t_top, t_h - 1))
                t_right = max(t_left + 1, min(t_right, t_w))
                t_bottom = max(t_top + 1, min(t_bottom, t_h))
                
                thermal_crop = thermal_image.crop((t_left, t_top, t_right, t_bottom))
                
            # Run vision analysis
            meta = {"overall_thermal_mean": overall_thermal_mean}
            res = analyzer.analyze_zone(rgb_crop, thermal_crop, metadata=meta)
            
            # Set scores
            zone.soiling_score = res.soiling_score
            zone.shading_score = res.shading_score
            zone.thermal_score = res.thermal_score
            zone.damage_score = res.damage_score
            
            # Set generation loss score (check for zone-specific or fallback to global)
            zone.generation_loss_score = loss_data.get(zone.zone_code, global_loss)
            
            # Temporary state for labels (updated by RecommendationService later)
            zone.status_label = res.status_label
            zone.explanation = res.explanation
            
        # Commit cropped evaluations
        db.commit()
        
        # 5. Generate Recommendations
        actions = RecommendationService.generate_recommendations(
            db=db,
            inspection=inspection,
            plant=plant,
            zones=zones,
            rain_expected=rain_expected
        )
        
        # 6. Update inspection status
        inspection.status = "analyzed"
        inspection.analyzed_at = datetime.now()
        db.commit()
        
        # 7. Build summary metrics
        total = len(zones)
        normal = sum(1 for z in zones if z.recommendation_label == "NORMAL_MONITORING")
        cleaning = sum(1 for z in zones if z.recommendation_label == "CLEANING_PRIORITY")
        inspections = sum(1 for z in zones if z.recommendation_label == "INSPECTION_REQUIRED")
        rain = sum(1 for z in zones if z.recommendation_label == "WAIT_FOR_RAIN")
        repair = sum(1 for z in zones if z.recommendation_label == "REPAIR_REVIEW")
        avg_priority = float(sum(z.priority_score for z in zones) / total) if total > 0 else 0.0
        
        return {
            "inspection_id": inspection.id,
            "status": "analyzed",
            "summary": {
                "total_zones": total,
                "normal_count": normal,
                "cleaning_priority_count": cleaning,
                "inspection_required_count": inspections,
                "wait_for_rain_count": rain,
                "repair_review_count": repair,
                "average_priority_score": round(avg_priority, 1)
            },
            "top_actions": actions
        }
