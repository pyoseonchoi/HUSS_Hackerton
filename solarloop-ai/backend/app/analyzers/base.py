from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class ZoneAnalysisResult:
    def __init__(
        self,
        soiling_score: float,
        shading_score: float,
        thermal_score: float,
        damage_score: float,
        status_label: str,
        explanation: str
    ):
        self.soiling_score = soiling_score
        self.shading_score = shading_score
        self.thermal_score = thermal_score
        self.damage_score = damage_score
        self.status_label = status_label
        self.explanation = explanation

class BaseAnalyzer(ABC):
    @abstractmethod
    def analyze_zone(
        self,
        rgb_crop,
        thermal_crop=None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> ZoneAnalysisResult:
        """
        Analyze a cropped zone image (RGB and optionally thermal) and return diagnostic scores.
        """
        pass
