import json
import os
from typing import Dict, Any

class WeatherService:
    @staticmethod
    def get_weather_data(weather_json_path: str) -> Dict[str, Any]:
        """
        Reads and parses the weather JSON file.
        Returns a dictionary with defaults if the file does not exist or fails to parse.
        """
        default_data = {
            "rain_expected_within_24h": False,
            "rain_probability": 0,
            "temperature": 25.0
        }
        
        if not weather_json_path:
            return default_data
            
        full_path = os.path.join("app", weather_json_path)
        if not os.path.exists(full_path):
            return default_data
            
        try:
            with open(full_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                
            return {
                "rain_expected_within_24h": data.get("rain_expected_within_24h", False),
                "rain_probability": data.get("rain_probability", 0),
                "temperature": data.get("temperature", 25.0)
            }
        except Exception:
            return default_data
