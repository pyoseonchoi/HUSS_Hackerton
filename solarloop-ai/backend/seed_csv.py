import os
import csv
import random
import sys
from datetime import datetime, timedelta

# Append current directory to path to resolve imports correctly
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(backend_dir)

from app.core.database import Base, engine
from app.models.plant import Plant
# Explicitly import all related models to compile SQLAlchemy mappers properly
from app.models.inspection import Inspection
from app.models.panel_zone import PanelZone
from app.models.maintenance_action import MaintenanceAction
from sqlalchemy.orm import sessionmaker

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed_from_csv():
    db = SessionLocal()
    try:
        # 1. Clean up existing data to start clean
        print("Cleaning up old database tables...")
        db.query(MaintenanceAction).delete()
        db.query(PanelZone).delete()
        db.query(Inspection).delete()
        db.query(Plant).delete()
        db.commit()
        
        csv_path = os.path.join(backend_dir, "data", "20250827.csv")
        if not os.path.exists(csv_path):
            print(f"Error: KOSPO CSV data file not found at {csv_path}")
            return
            
        print(f"Loading data from {csv_path}...")
        
        # We will use the default files created in the app/static folder
        generation_csv_url = "/static/default_generation.csv"
        weather_json_url = "/static/default_weather.json"

        with open(csv_path, "r", encoding="cp949") as f:
            reader = csv.reader(f)
            header = next(reader)  # Skip header
            
            plants_created = 0
            for row in reader:
                if not row or len(row) < 4:
                    continue
                
                raw_name = row[0].strip()
                hogi = row[1].strip()
                lat_str = row[2].strip()
                lng_str = row[3].strip()
                
                if not lat_str or not lng_str:
                    continue
                    
                lat = float(lat_str)
                lng = float(lng_str)
                
                # Rule-based regional address estimation based on geographic coordinates
                if lat < 34.0:
                    location_name = "제주특별자치도 서귀포시"
                elif 34.9 <= lat <= 35.1 and 127.7 <= lng <= 127.9:
                    location_name = "경상남도 하동군 금성면"
                elif 35.0 <= lat <= 35.2 and 128.8 <= lng <= 129.1:
                    location_name = "부산광역시 강서구"
                elif 37.3 <= lat <= 37.5 and 126.6 <= lng <= 127.5:
                    if "인천" in raw_name:
                        location_name = "인천광역시 서구 백범로"
                    else:
                        location_name = "경기도 이천시 백사면"
                elif 36.8 <= lat <= 37.0:
                    location_name = "충청북도 음성군 감우리"
                else:
                    location_name = "경상남도 하동군"
                
                # Format name nicely
                name = f"{raw_name} {hogi}호기"
                
                # Infer plant type logically
                if "주차장" in raw_name or "선상" in raw_name:
                    plant_type = "rooftop"
                elif "정수장" in raw_name or "변전소" in raw_name or "보건소" in raw_name:
                    plant_type = "public_building"
                else:
                    plant_type = "ground"
                
                # Randomize realistic capacities (50kW to 350kW)
                capacity_kw = round(random.uniform(50.0, 350.0), 1)
                
                plant = Plant(
                    name=name,
                    location_name=location_name,
                    latitude=lat,
                    longitude=lng,
                    plant_type=plant_type,
                    capacity_kw=capacity_kw,
                    owner_name="한국남부발전"
                )
                db.add(plant)
                db.flush() # Populate plant.id

                # Assign image paths based on plant type
                if plant_type == "rooftop":
                    rgb_image_url = "/static/default_rgb_rooftop.png"
                    thermal_image_url = "/static/default_thermal_rooftop.png"
                elif plant_type == "public_building":
                    rgb_image_url = "/static/default_rgb_floating.png"
                    thermal_image_url = "/static/default_thermal_floating.png"
                else:
                    rgb_image_url = "/static/default_rgb.jpg"
                    thermal_image_url = "/static/default_thermal.jpg"

                # Create 1 auto-diagnostic Inspection record for this plant
                inspection = Inspection(
                    plant_id=plant.id,
                    title="드론 점검 및 AI 진단 보고서",
                    rgb_image_path=rgb_image_url,
                    thermal_image_path=thermal_image_url,
                    generation_csv_path=generation_csv_url,
                    weather_json_path=weather_json_url,
                    rows=4,
                    cols=6,
                    status="analyzed",
                    created_at=datetime.now() - timedelta(days=2),
                    analyzed_at=datetime.now() - timedelta(days=2, hours=23)
                )
                db.add(inspection)
                db.flush() # Populate inspection.id

                # Generate 24 zones (4x6 layout)
                rows_count = 4
                cols_count = 6
                
                # Classify plant severity type:
                # 0: Normal (Green)
                # 1: Warning (Orange)
                # 2: Critical (Red)
                plant_severity_type = plants_created % 3
                
                # Pre-select warning type for Warning plants (type 1)
                warning_type = random.choice(["SOILING", "SHADING"]) if plant_severity_type == 1 else None
                
                # Decide which cells will have simulated defects
                if "부산역 선상주차장" in name:
                    defect_cells = [(1, 2), (1, 3)]
                elif plant_severity_type == 0:
                    defect_cells = []
                elif plant_severity_type == 1:
                    defect_cells = random.sample([(r, c) for r in range(rows_count) for c in range(cols_count)], 1)
                else:  # plant_severity_type == 2
                    defect_cells = random.sample([(r, c) for r in range(rows_count) for c in range(cols_count)], 2)

                row_letters = ['A', 'B', 'C', 'D']
                for r in range(rows_count):
                    for c in range(cols_count):
                        zone_code = f"{row_letters[r]}-{c+1:02d}"
                        
                        # Default is Normal
                        soiling = round(random.uniform(1.0, 8.0), 1)
                        shading = round(random.uniform(0.0, 5.0), 1)
                        thermal = round(random.uniform(20.0, 35.0), 1)  # Celcius
                        damage = round(random.uniform(0.0, 3.0), 1)
                        loss = round(random.uniform(0.1, 2.0), 1)
                        priority = round(random.uniform(5.0, 15.0), 1)
                        status_label = "NORMAL"
                        recom_label = "NORMAL_MONITORING"
                        explanation = "전반적으로 패널의 발전 효율이 양호하며, 특이 결함이 식별되지 않았습니다."
                        
                        # Apply defect if it's a chosen cell
                        if plant_severity_type == 1:
                            if (r, c) == defect_cells[0]:
                                if warning_type == "SOILING":
                                    soiling = round(random.uniform(65.0, 92.0), 1)
                                    loss = round(random.uniform(15.0, 25.0), 1)
                                    priority = round(soiling * 0.6 + loss * 0.4, 1)
                                    status_label = "SOILING"
                                    recom_label = "CLEANING_PRIORITY"
                                    explanation = "패널 표면에 황사 및 조류 분변으로 인한 두터운 오염층이 누적되어 빛 투과율이 급감했습니다. 세척 조치가 요구됩니다."
                                else:
                                    shading = round(random.uniform(30.0, 60.0), 1)
                                    loss = round(random.uniform(10.0, 20.0), 1)
                                    priority = round(shading * 0.5 + loss * 0.5, 1)
                                    status_label = "SHADING"
                                    recom_label = "WAIT_FOR_RAIN"
                                    explanation = "패널 일부에 구역 음영이 발생하여 출력이 소폭 하락했습니다. 예보상 예정된 강우 이후 자연 세정 효과 추이를 파악하십시오."
                        elif plant_severity_type == 2:
                            if (r, c) == defect_cells[0]:
                                soiling = round(random.uniform(65.0, 92.0), 1)
                                loss = round(random.uniform(15.0, 25.0), 1)
                                priority = round(soiling * 0.6 + loss * 0.4, 1)
                                status_label = "SOILING"
                                recom_label = "CLEANING_PRIORITY"
                                explanation = "패널 표면에 황사 및 조류 분변으로 인한 두터운 오염층이 누적되어 빛 투과율이 급감했습니다. 세척 조치가 요구됩니다."
                            elif (r, c) == defect_cells[1]:
                                thermal = round(random.uniform(55.0, 82.0), 1) # Hot spot Celsius
                                loss = round(random.uniform(25.0, 55.0), 1)
                                priority = round((thermal - 30) * 1.5 + loss * 0.5, 1)
                                status_label = "THERMAL_ANOMALY"
                                recom_label = "INSPECTION_REQUIRED"
                                explanation = "드론 열화상 스캔에서 주위 대비 25℃ 이상 높은 국소 열이상(Hot Spot) 지점이 감지되었습니다. 바이패스 다이오드 고장 의심."

                        # Check empty zones for concrete/rooftop plants
                        is_empty_zone = zone_code in ['D-01', 'D-02', 'D-05', 'D-06', 'C-01', 'C-06', 'B-06', 'A-06']
                        
                        modules_list = []
                        if is_empty_zone:
                            soiling = 0.0
                            shading = 0.0
                            thermal = 0.0
                            damage = 0.0
                            loss = 0.0
                            priority = 0.0
                            status_label = "NORMAL"
                            recom_label = "ANALYSIS_EXCLUDED"
                            explanation = "이 구역은 태양광 패널이 존재하지 않는 빈 공간(옥상 바닥 또는 공터)으로 자동 분류되어 분석에서 제외되었습니다."
                        else:
                            # Generate 6 modules
                            base_pts = [
                                [[0.04, 0.24], [0.23, 0.07], [0.35, 0.42], [0.16, 0.59]],
                                [[0.26, 0.23], [0.45, 0.06], [0.57, 0.41], [0.38, 0.58]],
                                [[0.48, 0.22], [0.67, 0.05], [0.79, 0.40], [0.60, 0.57]],
                                [[0.11, 0.62], [0.30, 0.45], [0.42, 0.80], [0.23, 0.97]],
                                [[0.33, 0.61], [0.52, 0.44], [0.64, 0.79], [0.45, 0.96]],
                                [[0.55, 0.60], [0.74, 0.43], [0.86, 0.78], [0.67, 0.95]]
                            ]
                            for idx, pts in enumerate(base_pts):
                                mod_num = idx + 1
                                noisy_pts = []
                                for pt in pts:
                                    nx = pt[0] + random.uniform(-0.012, 0.012)
                                    ny = pt[1] + random.uniform(-0.012, 0.012)
                                    noisy_pts.append([round(max(0.0, min(1.0, nx)), 3), round(max(0.0, min(1.0, ny)), 3)])
                                
                                mod_status = "NORMAL"
                                if recom_label == "CLEANING_PRIORITY" and mod_num == 2:
                                    mod_status = "SOILING"
                                elif recom_label == "INSPECTION_REQUIRED" and mod_num == 3:
                                    mod_status = "HOTSPOT"
                                elif recom_label == "WAIT_FOR_RAIN" and mod_num == 1:
                                    mod_status = "SHADING"
                                
                                modules_list.append({
                                    "module_number": mod_num,
                                    "polygon": noisy_pts,
                                    "confidence": round(random.uniform(0.93, 0.995), 3),
                                    "status": mod_status
                                })

                        # Normalize 0-100 scores to 0.0-1.0
                        norm_soiling = round(soiling / 100.0, 3)
                        norm_shading = round(shading / 100.0, 3)
                        norm_thermal = round(thermal / 100.0, 3)
                        norm_damage = round(damage / 100.0, 3)
                        norm_loss = round(loss / 100.0, 3)
                        norm_priority = round(priority, 1)

                        # Width/Height coordinate mappings (0.0 to 1.0)
                        x_coord = round(c / cols_count, 3)
                        y_coord = round(r / rows_count, 3)
                        w_val = round(1.0 / cols_count, 3)
                        h_val = round(1.0 / rows_count, 3)
                        
                        import json
                        zone = PanelZone(
                            inspection_id=inspection.id,
                            zone_code=zone_code,
                            row_index=r,
                            col_index=c,
                            x=x_coord,
                            y=y_coord,
                            width=w_val,
                            height=h_val,
                            soiling_score=norm_soiling,
                            shading_score=norm_shading,
                            thermal_score=norm_thermal,
                            damage_score=norm_damage,
                            generation_loss_score=norm_loss,
                            priority_score=norm_priority,
                            status_label=status_label,
                            recommendation_label=recom_label,
                            explanation=explanation,
                            modules_json=json.dumps(modules_list)
                        )
                        db.add(zone)
                
                # Create corresponding MaintenanceAction entries based on defect cells
                if plant_severity_type == 0:
                    # Clean/normal plant actions
                    action1 = MaintenanceAction(
                        inspection_id=inspection.id,
                        zone_code="A-01",
                        action_type="NORMAL_MONITORING",
                        priority_rank=1,
                        expected_recovery_kwh=0.0,
                        reason="태양광 발전설비 정밀 원격 진단 결과, 이상 현상이 감지되지 않고 양호하게 상시 가동 중입니다."
                    )
                    action2 = MaintenanceAction(
                        inspection_id=inspection.id,
                        zone_code="B-02",
                        action_type="NORMAL_MONITORING",
                        priority_rank=2,
                        expected_recovery_kwh=0.0,
                        reason="열화상 분포 스캐닝 및 표면 먼지 점검 수치가 정상 기준치 이내입니다."
                    )
                    action3 = MaintenanceAction(
                        inspection_id=inspection.id,
                        zone_code="C-03",
                        action_type="NORMAL_MONITORING",
                        priority_rank=3,
                        expected_recovery_kwh=0.0,
                        reason="특이 조치 사항 없음. 차기 드론 진단 비행 일정까지 모니터링 시스템을 지속 운영합니다."
                    )
                elif plant_severity_type == 1:
                    # Warning plant actions
                    defect_zone_code = f"{row_letters[defect_cells[0][0]]}-{defect_cells[0][1]+1:02d}"
                    if warning_type == "SOILING":
                        action1 = MaintenanceAction(
                            inspection_id=inspection.id,
                            zone_code=defect_zone_code,
                            action_type="CLEANING_PRIORITY",
                            priority_rank=1,
                            expected_recovery_kwh=round(random.uniform(5.5, 12.0), 1),
                            reason="오염 지수 감지 레벨 75% 초과. 패널 먼지 세척 작업 완료 시 약 8% 이상의 즉각적인 발전 효율 회복 예상."
                        )
                    else:
                        action1 = MaintenanceAction(
                            inspection_id=inspection.id,
                            zone_code=defect_zone_code,
                            action_type="WAIT_FOR_RAIN",
                            priority_rank=1,
                            expected_recovery_kwh=round(random.uniform(2.0, 5.0), 1),
                            reason="구역 음영 수준이 경미하여 우선 24시간 내 강우 여부를 파악한 뒤 세정 효과 추이를 관찰할 것을 권장합니다."
                        )
                    action2 = MaintenanceAction(
                        inspection_id=inspection.id,
                        zone_code="B-03" if defect_zone_code != "B-03" else "C-03",
                        action_type="NORMAL_MONITORING",
                        priority_rank=2,
                        expected_recovery_kwh=0.0,
                        reason="열화상 분포 스캐닝 및 표면 먼지 점검 수치가 정상 기준치 이내입니다."
                    )
                    action3 = MaintenanceAction(
                        inspection_id=inspection.id,
                        zone_code="A-03" if defect_zone_code != "A-03" else "B-03",
                        action_type="NORMAL_MONITORING",
                        priority_rank=3,
                        expected_recovery_kwh=0.0,
                        reason="특이 조치 사항 없음. 차기 드론 진단 비행 일정까지 모니터링 시스템을 지속 운영합니다."
                    )
                else: # plant_severity_type == 2
                    # Defective plant actions
                    # Action 1: Thermal Hotspot inspection
                    action1 = MaintenanceAction(
                        inspection_id=inspection.id,
                        zone_code=f"{row_letters[defect_cells[1][0]]}-{defect_cells[1][1]+1:02d}",
                        action_type="INSPECTION_REQUIRED",
                        priority_rank=1,
                        expected_recovery_kwh=round(random.uniform(15.5, 30.0), 1),
                        reason="열화상 스펙트럼 스캐닝 결과 55℃ 초과 핫스팟 발견. 장기 방치 시 융해(Melting) 위험이 있어 1순위 긴급 현장 점검 권장."
                    )
                    # Action 2: Soiling cleaning
                    action2 = MaintenanceAction(
                        inspection_id=inspection.id,
                        zone_code=f"{row_letters[defect_cells[0][0]]}-{defect_cells[0][1]+1:02d}",
                        action_type="CLEANING_PRIORITY",
                        priority_rank=2,
                        expected_recovery_kwh=round(random.uniform(5.5, 12.0), 1),
                        reason="오염 지수 감지 레벨 75% 초과. 패널 먼지 세척 작업 완료 시 약 8% 이상의 즉각적인 발전 효율 회복 예상."
                    )
                    # Action 3: Normal watch
                    action3 = MaintenanceAction(
                        inspection_id=inspection.id,
                        zone_code="A-03" if (defect_cells[0] != (0,2) and defect_cells[1] != (0,2)) else "B-03",
                        action_type="NORMAL_MONITORING",
                        priority_rank=3,
                        expected_recovery_kwh=0.0,
                        reason="안정적인 상시 모니터링 구역입니다. 특별한 유지 관리 개입 없이 차기 드론 비행 시 상태 재스캔 예정."
                    )
                db.add(action1)
                db.add(action2)
                db.add(action3)

                plants_created += 1
                
        db.commit()
        print(f"Successfully loaded {plants_created} actual KOSPO solar plants with fully analyzed diagnostic mock data into DB!")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_from_csv()
