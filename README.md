# SolarLoop AI — 드론 및 비전 AI 기반 태양광 패널 유지관리 플랫폼

SolarLoop AI는 드론으로 촬영한 태양광 패널 RGB 이미지와 열화상(Thermal) 이미지, 발전량 CSV 로그, 기상 예보 JSON 데이터를 통합하여 태양광 패널의 **오염(Soiling), 음영(Shading), 열이상(Thermal Anomaly), 물리손상(Physical Damage)** 및 **발전 손실 가능성**을 규칙 기반 엔진으로 정밀 진단하는 유지관리 플랫폼입니다.

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
HUSS_해커톤/
  .github/           # GitHub Actions 자동 배포 워크플로우 (.yml)
  solarloop-ai/      # 메인 소스코드 디렉토리
    backend/         # FastAPI 백엔드 (SQLite DB, 규칙 기반 엔진)
      app/
        main.py      # 진입점 및 DB 자동 마이그레이션
        analyzers/   # 규칙 기반 / 비전 분석 인터페이스
        models/      # SQLAlchemy ORM 모델
        schemas/     # Pydantic v2 스키마
        routers/     # API 라우터 (발전소, 점검, 통계, 데모)
        services/    # 비즈니스 로직 (크롭, 손실 평가, 날씨, 추천)
        static/      # 업로드 폴더 (드론 이미지 저장)
    frontend/        # React + Vite + TypeScript 프론트엔드
      src/
        api/         # Axios API 클라이언트
        components/  # 글래스모피즘 공통 컴포넌트 (그리드, 레이더 차트 등)
        pages/       # 대시보드 및 상세 페이지
        types/       # TypeScript 타입 정의
        utils/       # 스타일/포맷 유틸리티
```

---

## 3. 실행 및 설치 방법

### 3-1. 백엔드 (FastAPI)
```bash
cd solarloop-ai/backend
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
cd solarloop-ai/frontend
npm install
npm run dev
```
- **접속 주소**: [http://localhost:5173](http://localhost:5173)

---

## 4. CI/CD 및 자동 배포 설정
이 프로젝트는 Cloudtype과 연동된 **GitHub Actions CI/CD 파이프라인**을 제공합니다.
- **백엔드 배포 워크플로우**: `.github/workflows/deploy-backend.yml`
- **프론트엔드 배포 워크플로우**: `.github/workflows/deploy-frontend.yml`

지정된 폴더(`solarloop-ai/backend` 혹은 `solarloop-ai/frontend`)의 소스코드가 수정된 후 `main` 브랜치로 푸시되면, 각각의 워크플로우가 감지하여 클라우드로 자동 빌드 및 배포를 완료합니다.

---

## 5. 해커톤 시연 시나리오 및 기능 검증

1. **대시보드 접속**: [http://localhost:5173](http://localhost:5173)에 접속합니다.
2. **원격 진단 지도 확인**: 화면 좌측의 '비행 드론 실시간 원격 진단 지도' 및 CartoDB Positron 기반의 그레이스케일 지도를 통해 전국 발전소의 상태(정상/주의/심각)를 모니터링합니다.
3. **상세 페이지 및 이미지 매핑**:
   - 지도의 마커를 클릭하여 팝업을 띄운 뒤, **"상세 뷰어로 이동"** 버튼을 클릭합니다.
   - **가시광선 (RGB)** 카메라 이미지와 실시간 합성된 **열화상 (Thermal)** 카메라 이미지의 물리적 레이아웃이 정확히 매치되는 것을 확인합니다.
   - 열화상 이미지에서는 B-03, C-02, C-04 등의 이상이 탐지된 그리드 영역에 맞추어 사실적인 발열 지점(Hotspot)이 주입되어 나타납니다.
4. **유지보수 조치 제언 확인**:
   - 스크롤을 맨 아래로 내려 우측의 **'오늘의 관리 우선순위'** 목록을 통해 정비 필요도가 높은 구역이 우선순위화되어 정렬된 것을 확인합니다.
   - 결함 원인과 함께 청소/점검 완료 시 복구할 수 있는 예상 전력량(예: **⚡ +1.5kW 복구**)이 초록색 번개 뱃지로 표시됩니다.
5. **원격 모듈 제어 시뮬레이션**:
   - 그리드의 특정 셀 혹은 보고서 하단의 구역 상세 창에서 마이크로인버터 원격 차단(OFF/ON) 버튼을 누르면 토스트 알림이 오며 원격으로 패널 동작을 제어하는 통신을 가상 시연할 수 있습니다.
