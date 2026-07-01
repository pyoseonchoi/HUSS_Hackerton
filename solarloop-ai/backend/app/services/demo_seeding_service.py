import os
import json
import csv
from datetime import datetime
from PIL import Image, ImageDraw
from sqlalchemy.orm import Session
from app.models.plant import Plant
from app.models.inspection import Inspection
from app.models.panel_zone import PanelZone
from app.services.panel_grid_service import PanelGridService
from app.services.analysis_service import AnalysisService

class DemoSeedingService:
    @staticmethod
    def seed_demo_data(db: Session) -> int:
        """
        Seeds mock solar plants, drone inspections, generation CSVs, weather JSONs,
        and generates visual JPG/PNG assets using Pillow.
        Runs analysis automatically and returns the seeded inspection ID.
        """
        # 1. Create or Get Demo Plant
        plant = db.query(Plant).filter(Plant.name == "경북대 IT융합희망관 옥상 태양광").first()
        if not plant:
            plant = Plant(
                name="경북대 IT융합희망관 옥상 태양광",
                location_name="대구 북구 대학로 80",
                latitude=35.8882,
                longitude=128.6105,
                plant_type="rooftop",
                capacity_kw=65.5,
                owner_name="경북대 시설관리팀"
            )
            db.add(plant)
            db.commit()
            db.refresh(plant)
            
        # 2. Setup folders and file paths
        demo_dir = os.path.join("app", "static", "uploads", "demo")
        os.makedirs(demo_dir, exist_ok=True)
        
        rgb_path = "static/uploads/demo/rgb_sample.jpg"
        thermal_path = "static/uploads/demo/thermal_sample.jpg"
        csv_path = "static/uploads/demo/generation_sample.csv"
        json_path = "static/uploads/demo/weather_sample.json"
        
        # 3. Create mock files if they don't exist
        rows, cols = 4, 6
        DemoSeedingService._generate_rgb_image(os.path.join("app", rgb_path), rows, cols)
        DemoSeedingService._generate_thermal_image(os.path.join("app", thermal_path), rows, cols)
        DemoSeedingService._generate_csv_data(os.path.join("app", csv_path))
        DemoSeedingService._generate_weather_json(os.path.join("app", json_path))
        
        # 4. Create or reuse Inspection
        # We always create a new one to demonstrate seeding multiple times, or reuse the most recent one if preferred.
        # Let's create a new one for high fidelity.
        inspection = Inspection(
            plant_id=plant.id,
            title=f"드론 자율점검 - {datetime.now().strftime('%Y-%m-%d %H:%M')}",
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
        
        # 5. Build Initial Grid
        PanelGridService.create_initial_grid(db, inspection)
        
        # 6. Run Analysis immediately
        AnalysisService.run_analysis(db, inspection.id)
        
        return inspection.id

    @staticmethod
    def _generate_rgb_image(path: str, rows: int, cols: int) -> None:
        """
        Generates a simulated solar panel grid.
        - Deep blue solar cells.
        - Cell A-03 (row 0, col 2) has brown dirt (soiling).
        - Cell B-04 (row 1, col 3) has green weed/leaf coverage (soiling).
        - Cell C-05 (row 2, col 4) has a dark shadow diagonal overlay (shading).
        """
        if os.path.exists(path):
            return
            
        w, h = 960, 640
        img = Image.new("RGB", (w, h), (20, 30, 60)) # dark background
        draw = ImageDraw.Draw(img)
        
        cell_w = w / cols
        cell_h = h / rows
        
        # Draw solar panel cells
        for r in range(rows):
            for c in range(cols):
                cx1 = int(c * cell_w + 4)
                cy1 = int(r * cell_h + 4)
                cx2 = int((c + 1) * cell_w - 4)
                cy2 = int((r + 1) * cell_h - 4)
                
                # Default clean blue solar panel cell
                draw.rectangle((cx1, cy1, cx2, cy2), fill=(15, 60, 150), outline=(220, 220, 220), width=2)
                
                # Draw typical grid lines within solar cells (solar busbars)
                for line_x in range(cx1 + 10, cx2, 20):
                    draw.line((line_x, cy1, line_x, cy2), fill=(255, 255, 255, 100), width=1)
                    
                # Anomaly injections
                # Row 0, Col 2 -> Dust/Soiling (A-03)
                if r == 0 and c == 2:
                    # Draw dusty brownish spots
                    draw.ellipse((cx1 + 15, cy1 + 15, cx2 - 15, cy2 - 15), fill=(139, 115, 85))
                    draw.ellipse((cx1 + 40, cy1 + 10, cx2 - 10, cy2 - 35), fill=(120, 100, 80))
                    
                # Row 1, Col 3 -> Weed/Vegetation (B-04)
                if r == 1 and c == 3:
                    # Draw green leaf spots
                    draw.polygon([
                        (cx1 + 10, cy1 + 40), (cx1 + 50, cy1 + 10), 
                        (cx2 - 10, cy1 + 30), (cx1 + 60, cy2 - 10)
                    ], fill=(34, 139, 34))
                    
                # Row 2, Col 4 -> Shading (C-05)
                if r == 2 and c == 4:
                    # Draw dark shadow
                    draw.polygon([
                        (cx1 - 5, cy1 - 5), (cx1 + 80, cy1 - 5), 
                        (cx1 - 5, cy1 + 90)
                    ], fill=(5, 10, 25))
                    
        img.save(path, "JPEG")

    @staticmethod
    def _generate_thermal_image(path: str, rows: int, cols: int) -> None:
        """
        Generates simulated infrared image.
        - Purple / Dark blue represents normal cool operating temperature.
        - Cell D-02 (row 3, col 1) has a bright yellow/red hotspot.
        """
        if os.path.exists(path):
            return
            
        w, h = 960, 640
        img = Image.new("RGB", (w, h), (40, 10, 80)) # Cool purple infrared default
        draw = ImageDraw.Draw(img)
        
        cell_w = w / cols
        cell_h = h / rows
        
        for r in range(rows):
            for c in range(cols):
                cx1 = int(c * cell_w + 4)
                cy1 = int(r * cell_h + 4)
                cx2 = int((c + 1) * cell_w - 4)
                cy2 = int((r + 1) * cell_h - 4)
                
                # Normal thermal cells: bluish purple
                draw.rectangle((cx1, cy1, cx2, cy2), fill=(40, 15, 90), outline=(80, 40, 120), width=1)
                
                # Row 3, Col 1 -> Thermal hotspot anomaly (D-02)
                if r == 3 and c == 1:
                    # Draw bright radiant hotspot (yellow center, red outer ring)
                    draw.ellipse((cx1 + 10, cy1 + 10, cx2 - 10, cy2 - 10), fill=(255, 40, 0))
                    draw.ellipse((cx1 + 30, cy1 + 30, cx2 - 30, cy2 - 30), fill=(255, 230, 0))
                    draw.ellipse((cx1 + 50, cy1 + 50, cx2 - 50, cy2 - 50), fill=(255, 255, 200))
                    
        img.save(path, "JPEG")

    @staticmethod
    def _generate_csv_data(path: str) -> None:
        if os.path.exists(path):
            return
            
        data = [
            ["timestamp", "expected_kwh", "actual_kwh", "irradiance", "temperature"],
            ["2026-06-01 09:00", 12.0, 9.8, 650, 24.5],
            ["2026-06-01 10:00", 18.5, 14.2, 750, 26.2],
            ["2026-06-01 11:00", 25.0, 18.0, 850, 27.8],
            ["2026-06-01 12:00", 28.0, 19.5, 900, 29.0],
            ["2026-06-01 13:00", 29.5, 20.1, 920, 29.5],
            ["2026-06-01 14:00", 27.0, 18.8, 880, 28.7],
            ["2026-06-01 15:00", 21.0, 15.0, 720, 27.3],
            ["2026-06-01 16:00", 14.5, 10.5, 550, 25.8]
        ]
        
        with open(path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerows(data)

    @staticmethod
    def _generate_weather_json(path: str) -> None:
        if os.path.exists(path):
            return
            
        data = {
            "rain_expected_within_24h": False,
            "rain_probability": 15,
            "temperature": 28.5
        }
        
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
