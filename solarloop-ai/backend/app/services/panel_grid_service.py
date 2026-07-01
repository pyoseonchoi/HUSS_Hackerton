from sqlalchemy.orm import Session
from app.models.panel_zone import PanelZone
from app.models.inspection import Inspection

class PanelGridService:
    @staticmethod
    def create_initial_grid(db: Session, inspection: Inspection) -> None:
        """
        Creates row x col initial grid zones for an inspection.
        Computes relative coordinate ratios (x, y, width, height) between 0.0 and 1.0.
        Row index maps to letters: 0 -> A, 1 -> B, etc.
        Column index maps to 1-based padded string: 0 -> 01, 1 -> 02, etc.
        """
        rows = inspection.rows
        cols = inspection.cols
        
        width = 1.0 / cols
        height = 1.0 / rows
        
        for r in range(rows):
            row_letter = chr(65 + r)  # 65 is 'A'
            for c in range(cols):
                col_str = f"{c + 1:02d}"
                zone_code = f"{row_letter}-{col_str}"
                
                x = c * width
                y = r * height
                
                zone = PanelZone(
                    inspection_id=inspection.id,
                    zone_code=zone_code,
                    row_index=r,
                    col_index=c,
                    x=x,
                    y=y,
                    width=width,
                    height=height,
                    soiling_score=0.0,
                    shading_score=0.0,
                    thermal_score=0.0,
                    damage_score=0.0,
                    generation_loss_score=0.0,
                    priority_score=0.0,
                    status_label="NORMAL",
                    recommendation_label="NORMAL_MONITORING",
                    explanation="분석 전 상태입니다."
                )
                db.add(zone)
        db.commit()
