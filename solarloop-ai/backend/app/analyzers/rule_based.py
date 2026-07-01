import numpy as np
from PIL import Image
from typing import Dict, Any, Optional
from app.analyzers.base import BaseAnalyzer, ZoneAnalysisResult

class RuleBasedAnalyzer(BaseAnalyzer):
    def analyze_zone(
        self,
        rgb_crop: Image.Image,
        thermal_crop: Optional[Image.Image] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> ZoneAnalysisResult:
        # Convert RGB crop to numpy array
        rgb_arr = np.array(rgb_crop.convert("RGB"))
        h, w, c = rgb_arr.shape
        total_pixels = h * w
        
        # RGB split
        r = rgb_arr[:, :, 0].astype(float)
        g = rgb_arr[:, :, 1].astype(float)
        b = rgb_arr[:, :, 2].astype(float)
        
        # Brightness (Average intensity)
        brightness = (r + g + b) / 3.0
        brightness_mean = float(np.mean(brightness) / 255.0)
        
        # Saturation (Difference between max and min color channels)
        max_val = np.maximum(np.maximum(r, g), b)
        min_val = np.minimum(np.minimum(r, g), b)
        # Avoid division by zero
        sat = np.where(max_val == 0, 0, (max_val - min_val) / max_val)
        saturation_mean = float(np.mean(sat))
        
        # Dark pixels (indicates shading) -> threshold brightness < 65
        dark_pixels = np.sum(brightness < 65)
        dark_pixel_ratio = float(dark_pixels / total_pixels)
        
        # Green pixels (leaves, bird droppings, or weeds growth)
        # Rule: G channel is significantly higher than R and B
        green_pixels = np.sum((g > r + 15) & (g > b + 15))
        green_pixel_ratio = float(green_pixels / total_pixels)
        
        # Grayish/Brownish pixels (indicates soil, dust, or dirt accumulation)
        # Brownish: Red is slightly higher than Green, Green is higher than Blue, moderate brightness
        brown_pixels = np.sum((r > g + 8) & (g > b + 5) & (r < 180) & (r > 70))
        # Grayish: minimal color variance, mid-brightness range (dust layer)
        gray_pixels = np.sum((max_val - min_val < 15) & (brightness > 60) & (brightness < 160))
        gray_brown_pixel_ratio = float((brown_pixels + gray_pixels) / total_pixels)
        
        # Contrast (standard deviation of intensity) - higher contrast indicates structural anomalies
        contrast_score = float(np.std(brightness) / 255.0)
        
        # Calculate Base Scores (scaled dynamically)
        shading_score = float(np.clip(dark_pixel_ratio * 2.5, 0.0, 1.0))
        soiling_score = float(np.clip(gray_brown_pixel_ratio * 2.0 + green_pixel_ratio * 3.0, 0.0, 1.0))
        damage_score = float(np.clip(contrast_score * 2.0, 0.0, 1.0))
        
        # Thermal anomaly detection
        thermal_score = 0.0
        if thermal_crop is not None:
            thermal_arr = np.array(thermal_crop.convert("L"))
            t_mean = float(np.mean(thermal_arr))
            
            # Fetch overall thermal mean if provided in metadata, otherwise use static baseline
            overall_thermal_mean = metadata.get("overall_thermal_mean", 128.0) if metadata else 128.0
            
            # Score contribution based on how hot this zone is compared to average
            if t_mean > overall_thermal_mean:
                thermal_score += (t_mean - overall_thermal_mean) / (255.0 - overall_thermal_mean)
            
            # Count hot pixels (> 220 in grayscale representation of thermal)
            hot_pixels = np.sum(thermal_arr > 220)
            hot_pixel_ratio = float(hot_pixels / total_pixels)
            thermal_score += hot_pixel_ratio * 3.0
            thermal_score = float(np.clip(thermal_score, 0.0, 1.0))
            
        # Classify the primary issue
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
                max_label = label
                
        if max_score < 0.35:
            max_label = "NORMAL"
            explanation = "구역 상태가 정상적이며 특이사항이 없습니다."
        else:
            if max_label == "SOILING":
                explanation = f"표면에 오염물(먼지/조류 분변/낙엽 등)이 감지되었습니다. (오염도 점수: {soiling_score:.2f})"
            elif max_label == "SHADING":
                explanation = f"인접 장애물이나 이물질로 인한 음영(그림자)이 발생하고 있습니다. (음영 점수: {shading_score:.2f})"
            elif max_label == "THERMAL_ANOMALY":
                explanation = f"열화상 이미지에서 비정상적인 고온 영역(핫스팟)이 확인되었습니다. (열이상 점수: {thermal_score:.2f})"
            elif max_label == "PHYSICAL_DAMAGE_SUSPECTED":
                explanation = f"패널 표면의 반사율 변화 또는 미세 크랙/손상이 의심됩니다. (손상 점수: {damage_score:.2f})"
            else:
                explanation = "정밀 분석이 필요합니다."
                
        return ZoneAnalysisResult(
            soiling_score=soiling_score,
            shading_score=shading_score,
            thermal_score=thermal_score,
            damage_score=damage_score,
            status_label=max_label,
            explanation=explanation
        )
