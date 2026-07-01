# SolarLoop AI — 태양광 패널 유지관리 플랫폼 MVP

SolarLoop AI는 드론으로 촬영한 태양광 패널 RGB 이미지와 선택적 열화상 이미지, 발전량 CSV 로그, 기상 예보 JSON 데이터를 결합해 태양광 패널의 **오염(Soiling), 음영(Shading), 열이상(Thermal Anomaly), 물리손상(Physical Damage)** 및 **발전 손실 가능성**을 인공지능 기반 규칙 엔진으로 정밀 진단하는 유지관리 플랫폼 MVP입니다.

---

## 1. 프로젝트 주요 아키텍처 및 알고리즘

### 1-1. 우선순위 점수 (Priority Score) 산출식
각 구역(Zone)별로 수집된 멀티모달 진단 점수와 외부 피드를 융합해 최적의 세척 및 점검 순위를 도출합니다.
```
priority_score = (
    soiling_score * 25
    + shading_score * 20
    + thermal_score * 30
    + damage_score * 25
    + generation_loss_score * 20
    + cluster_bonus
    - rain_cleaning_discount
)
```
- **클러스터 가중치 (`cluster_bonus`)**: 인접한 상하좌우 구역 중 오염(SOILING)이나 음영(SHADING) 상태인 이웃 셀 개수가 1개인 경우 `+5점`, 2개 이상일 경우 `+10점`을 부여해 공동 세척 시너지 효과를 고려합니다.
- **강우 감면 가중치 (`rain_cleaning_discount`)**: 24시간 내 강우 예보가 존재하고(`rain_expected_within_24h`가 true) 열이상이나 기계적 파손은 없이 순수 표면 오염 상태일 때, 자연 빗물 세척을 유도하기 위해 점수를 `10점 감면`합니다.
- 최종 점수는 `0 ~ 100`점 사이로 제한(Clamp)됩니다.

### 1-2. 조치 추천 핵심 규칙 (Recommendation Rules)
1. **`thermal_score >= 0.7` 또는 `damage_score >= 0.7`**
   - **`REPAIR_REVIEW` (수리 검토)**: 열이상 또는 물리적 손상 의심으로 부품 교체/수리 검토가 필요합니다.
2. **`thermal_score >= 0.5`**
   - **`INSPECTION_REQUIRED` (정밀점검 필요)**: 핫스팟 가능성이 있어 현장 정밀점검이 필요합니다.
3. **`soiling_score >= 0.6` 이고 강우 예보가 존재하며 `thermal_score < 0.4`**
   - **`WAIT_FOR_RAIN` (강우 후 재확인)**: 오염이 감지되었으나 강우 예보가 있어 자연 세척 후 재확인을 권장합니다.
4. **`soiling_score >= 0.5` 또는 `shading_score >= 0.5`**
   - **`CLEANING_PRIORITY` (세척 우선)**: 오염 또는 주변 음영으로 인한 발전 효율 저하가 의심되어 세척 및 장애물 제거가 필요합니다.
5. **`generation_loss_score >= 0.4` 이며 이미지 결함 점수가 모두 낮은 경우 (`< 0.4`)**
   - **`INSPECTION_REQUIRED` (정밀점검 필요)**: 외관상 이상은 뚜렷하지 않지만 발전량 손실이 감지되어 인버터 및 배선 점검을 추천합니다.
6. **나머지**
   - **`NORMAL_MONITORING` (정상 모니터링)**: 구역 상태가 양호하며 정기 모니터링을 유지합니다.

---

## 2. 모노레포 폴더 구조
```
solarloop-ai/
  backend/           # FastAPI 백엔드 (SQLite DB, 규칙 기반 엔진)
    app/
      main.py        # 진입점 및 DB 자동 마이그레이션
      analyzers/     # 규칙 기반 / 비전 분석 인터페이스
      models/        # SQLAlchemy ORM 모델
      schemas/       # Pydantic v2 스키마
      routers/       # API 라우터 (발전소, 점검, 통계, 데모)
      services/      # 비즈니스 로직 (크롭, 손실 평가, 날씨, 추천)
      static/        # 업로드 폴더 (드론 이미지 저장)
  frontend/          # React + Vite + TypeScript 프론트엔드
    src/
      api/           # Axios API 클라이언트
      components/    # 글래스모피즘 공통 컴포넌트 (그리드, 레이더 차트 등)
      pages/         # 대시보드 및 상세 페이지
      types/         # TypeScript 타입 정의
      utils/         # 스타일/포맷 유틸리티
```

---

## 3. 실행 및 설치 방법

### 3-1. 백엔드 (FastAPI)
```bash
cd backend
python -m venv venv
# Windows 가상환경 활성화
.\venv\Scripts\activate
# 의존성 설치
pip install -r requirements.txt
# uvicorn 서버 구동
uvicorn app.main:app --reload
```
- **API 문서 확인**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **헬스 체크**: [http://localhost:8000/health](http://localhost:8000/health)

### 3-2. 프론트엔드 (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
- **접속 주소**: [http://localhost:5173](http://localhost:5173)

---

## 4. 해커톤 시연 시나리오 및 기능 검증

1. **대시보드 접속**: [http://localhost:5173](http://localhost:5173)에 접속합니다. 대시보드 통계판에 데이터가 비어 있음을 확인합니다.
2. **원클릭 데모 생성**: 대시보드 상단의 **"원클릭 데모 데이터 생성"** 버튼을 누릅니다.
   - 백엔드는 Pillow 라이브러리를 통해 파란색 패널 셀 위에 갈색 오염 물질(A-03), 잡초(B-04), 그림자(C-05)가 그려진 **RGB 가상 이미지**와 핫스팟(D-02)이 묘사된 **열화상 가상 이미지**, **발전량 CSV**, **기상 JSON**을 실시간 생성합니다.
   - 생성과 즉시 규칙 엔진이 결함 영역 크롭 및 진단을 마친 뒤 생성 완료된 점검 상세페이지로 즉시 이동합니다.
3. **진단 대시보드 확인**:
   - **가시광선/열화상 탭**: 드론 촬영 사진 위에 반투명 좌표 가이드 라인(A-01 ~ D-06)이 겹쳐 보이는 것을 확인합니다.
   - **구역 상태 그리드**: 셀 추천 조치 등급별로 세련된 색상 코드가 나타나고 우선순위 점수가 부여된 것을 확인합니다.
   - **우선순위 리스트**: 우측 카드에 에너지 복구 기여도(kWh)가 높은 순서로 정렬된 유지보수 리스트가 실시간 업데이트된 것을 확인합니다.
   - **다차원 레이다 차트**: 개별 셀을 클릭하면, 5가지 원인의 비중이 레이다 차트로 화려하게 활성화되어 핫스팟 및 크랙의 정도를 분석할 수 있습니다.
4. **신규 발전소 및 파일 업로드 시뮬레이션**:
   - 좌측 메뉴에서 **"신규 발전소 등록"**으로 새 태양광 설비를 생성합니다.
   - **"신규 드론점검 등록"** 폼을 통해 임의의 이미지 파일과 `backend/app/sample_data/` 하위의 CSV/JSON 파일을 직접 업로드해 봅니다.
   - 새로 추가된 점검은 처음에 **"대기 중"** 상태이며, **"진단 분석 실행"** 버튼을 클릭하여 분석이 적용되는 전 과정을 시연할 수 있습니다.
