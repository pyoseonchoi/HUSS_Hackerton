import random
from typing import Dict, Any, Optional
from app.analyzers.base import BaseAnalyzer, ZoneAnalysisResult

class MockVisionAnalyzer(BaseAnalyzer):
    def analyze_zone(
        self,
        rgb_crop,
        thermal_crop=None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> ZoneAnalysisResult:
        """
        Mock Deep Learning vision analysis. Randomly assigns anomaly values.
        """
        soiling_score = random.uniform(0.0, 0.5)
        shading_score = random.uniform(0.0, 0.4)
        thermal_score = random.uniform(0.0, 0.3) if thermal_crop is not None else 0.0
        damage_score = random.uniform(0.0, 0.2)
        
        scores = {
            "SOILING": soiling_score,
            "SHADING": shading_score,
            "THERMAL_ANOMALY": thermal_score,
            "PHYSICAL_DAMAGE_SUSPECTED": damage_score
        }
        
        max_label = "NORMAL"
        max_score = 0.0
        for label, score in scores.items():
            if score > max_score:
                max_score = score
                max_label = score
                
        if max_score < 0.4:
            max_label = "NORMAL"
            explanation = "Mock DL: 구역이 정상 상태인 것으로 예측됩니다."
        else:
            explanation = f"Mock DL: {max_label} 분석 감지됨 (점수: {max_score:.2f})"
            
        return ZoneAnalysisResult(
            soiling_score=soiling_score,
            shading_score=shading_score,
            thermal_score=thermal_score,
            damage_score=damage_score,
            status_label=max_label if isinstance(max_label, str) else "NORMAL",
            explanation=explanation
        )
