from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.panel_zone import PanelZone
from app.models.maintenance_action import MaintenanceAction
from app.models.inspection import Inspection
from app.models.plant import Plant

class RecommendationService:
    @staticmethod
    def generate_recommendations(
        db: Session,
        inspection: Inspection,
        plant: Plant,
        zones: List[PanelZone],
        rain_expected: bool
    ) -> List[MaintenanceAction]:
        """
        Calculates priority scores, assigns recommendation labels,
        and saves prioritized MaintenanceAction records.
        """
        # Clear existing actions first
        db.query(MaintenanceAction).filter(MaintenanceAction.inspection_id == inspection.id).delete()
        
        # Helper to map grid coordinates to zone dict
        grid_map = {(z.row_index, z.col_index): z for z in zones}
        
        # 1. Update scores & recommendations for each zone
        for zone in zones:
            soiling = zone.soiling_score
            shading = zone.shading_score
            thermal = zone.thermal_score
            damage = zone.damage_score
            loss = zone.generation_loss_score
            
            # Cluster Bonus: check 4 neighbors (Up, Down, Left, Right)
            neighbor_anomalies = 0
            neighbors = [
                (zone.row_index - 1, zone.col_index),
                (zone.row_index + 1, zone.col_index),
                (zone.row_index, zone.col_index - 1),
                (zone.row_index, zone.col_index + 1)
            ]
            for r_idx, c_idx in neighbors:
                if (r_idx, c_idx) in grid_map:
                    nb = grid_map[(r_idx, c_idx)]
                    # If neighbor is dirty or shaded
                    if nb.status_label in ["SOILING", "SHADING"]:
                        neighbor_anomalies += 1
                        
            cluster_bonus = 0.0
            if neighbor_anomalies == 1:
                cluster_bonus = 5.0
            elif neighbor_anomalies >= 2:
                cluster_bonus = 10.0
                
            # Rain cleaning discount
            rain_cleaning_discount = 0.0
            if rain_expected and soiling >= 0.5 and thermal < 0.4 and damage < 0.4:
                rain_cleaning_discount = 10.0
                
            # Score formula
            priority_score = (
                soiling * 25.0
                + shading * 20.0
                + thermal * 30.0
                + damage * 25.0
                + loss * 20.0
                + cluster_bonus
                - rain_cleaning_discount
            )
            
            zone.priority_score = float(max(0.0, min(100.0, priority_score)))
            
            # Determine Recommendation Label and Explanation
            img_anom_low = (soiling < 0.4 and shading < 0.4 and thermal < 0.4 and damage < 0.4)
            
            if thermal >= 0.7 or damage >= 0.7:
                zone.recommendation_label = "REPAIR_REVIEW"
                zone.explanation = "열이상 또는 물리적 손상 의심으로 정밀 부품 교체/수리 검토가 필요합니다."
            elif thermal >= 0.5:
                zone.recommendation_label = "INSPECTION_REQUIRED"
                zone.explanation = "패널 국부 온도 상승(핫스팟) 가능성이 있어 현장 정밀점검이 필요합니다."
            elif soiling >= 0.6 and rain_expected and thermal < 0.4:
                zone.recommendation_label = "WAIT_FOR_RAIN"
                zone.explanation = "오염이 감지되었으나 강우 예보가 있어 자연 세척 후 상태 재확인을 권장합니다."
            elif soiling >= 0.5 or shading >= 0.5:
                zone.recommendation_label = "CLEANING_PRIORITY"
                zone.explanation = "오염 또는 주변 음영으로 인한 발전 효율 저하가 의심되어 세척 및 장애물 제거를 추천합니다."
            elif loss >= 0.4 and img_anom_low:
                zone.recommendation_label = "INSPECTION_REQUIRED"
                zone.explanation = "외관상 이상은 식별되지 않으나, 발전량 손실이 감지되어 인버터 및 결선 점검이 필요합니다."
            else:
                zone.recommendation_label = "NORMAL_MONITORING"
                zone.explanation = "구역 상태가 양호합니다. 지속적인 기본 정기 모니터링을 권장합니다."
                
        # Commit updated zone scores
        db.commit()
        
        # 2. Filter actions (only create actions for zones that are NOT NORMAL_MONITORING)
        actionable_zones = [z for z in zones if z.recommendation_label != "NORMAL_MONITORING"]
        
        # Sort by priority score descending
        actionable_zones.sort(key=lambda z: z.priority_score, reverse=True)
        
        actions = []
        for index, zone in enumerate(actionable_zones):
            rank = index + 1
            
            # Expected recovery power calculation
            # Standard estimation based on solar plant capacity and current zone loss
            # Expected recovery = plant_capacity * generation_loss_score * (average power scale coeff, e.g., 1.5)
            # If the zone recommendation is CLEANING_PRIORITY, the recovery could be estimated by loss * capacity / total_zones.
            total_zones = inspection.rows * inspection.cols
            zone_capacity = plant.capacity_kw / total_zones
            # Recovery is proportional to the local loss and capacity
            loss_score = zone.generation_loss_score if zone.generation_loss_score > 0 else 0.3
            expected_recovery = zone_capacity * loss_score * 2.2  # simple multiplier for daily kWh recovery estimate
            expected_recovery = round(max(0.1, expected_recovery), 2)
            
            action = MaintenanceAction(
                inspection_id=inspection.id,
                zone_code=zone.zone_code,
                action_type=zone.recommendation_label,
                priority_rank=rank,
                expected_recovery_kwh=expected_recovery,
                reason=zone.explanation
            )
            db.add(action)
            actions.append(action)
            
        db.commit()
        return actions
