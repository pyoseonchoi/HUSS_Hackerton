import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Play, Factory, AlertTriangle, ShieldCheck, HelpCircle, Activity, Info, BarChart } from 'lucide-react';
import { getInspectionDetail, analyzeInspection } from '../api/inspections';
import type { InspectionDetail, Inspection } from '../types/inspection';
import type { PanelZone } from '../types/analysis';

import PanelZoneGrid from '../components/PanelZoneGrid';
import PriorityActionList from '../components/PriorityActionList';
import ZoneDetailDrawer from '../components/ZoneDetailDrawer';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import RecommendationBadge from '../components/RecommendationBadge';
import { formatDate, formatScore, getPlantTypeLabel } from '../utils/format';
import { getStatusStyle, getStatusLabelKor } from '../utils/statusColor';

const InspectionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [detail, setDetail] = useState<InspectionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedZone, setSelectedZone] = useState<PanelZone | null>(null);
  const [imageTab, setImageTab] = useState<'rgb' | 'thermal'>('rgb');

  // Custom states for interactive remote control & zoom
  const [disabledModules, setDisabledModules] = useState<Record<string, Record<number, boolean>>>({});
  const [isZoomed, setIsZoomed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleToggleModule = (zoneCode: string, moduleNum: number) => {
    setDisabledModules(prev => {
      const zoneModules = prev[zoneCode] || {};
      const nextVal = !zoneModules[moduleNum];
      showToast(
        nextVal
          ? `[${zoneCode} 구역 - 모듈 #${moduleNum}] 마이크로인버터 원격 차단(OFF) 명령이 송신되었습니다.`
          : `[${zoneCode} 구역 - 모듈 #${moduleNum}] 마이크로인버터 원격 가동(ON) 명령이 송신되었습니다.`
      );
      return {
        ...prev,
        [zoneCode]: {
          ...zoneModules,
          [moduleNum]: nextVal
        }
      };
    });
  };

  const handleToggleInverter = (zoneCode: string) => {
    setDisabledModules(prev => {
      const zoneModules = prev[zoneCode] || {};
      const allDisabled = [1, 2, 3, 4, 5, 6].every(num => zoneModules[num]);
      const nextVal = !allDisabled;
      
      showToast(
        nextVal
          ? `[${zoneCode} 구역 전체] 마이크로인버터 원격 일괄 차단(OFF) 명령이 송신되었습니다.`
          : `[${zoneCode} 구역 전체] 마이크로인버터 원격 일괄 가동(ON) 명령이 송신되었습니다.`
      );
      
      const updatedModules: Record<number, boolean> = {};
      [1, 2, 3, 4, 5, 6].forEach(num => {
        updatedModules[num] = nextVal;
      });
      
      return {
        ...prev,
        [zoneCode]: updatedModules
      };
    });
  };

  const getZoomStyle = (): React.CSSProperties => {
    if (!selectedZone || !isZoomed) return {};
    const scale = 2.5;
    
    // Grid size is 4x6.
    // Calculate translate percentages based on zone position to center the target zone
    const tx = -(selectedZone.x * 100 - (100 / scale) / 2);
    const ty = -(selectedZone.y * 100 - (100 / scale) / 2);
    
    return {
      transform: `scale(${scale}) translate(${tx}%, ${ty}%)`,
      transformOrigin: 'top left',
      transition: 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)'
    };
  };

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id]);

  const fetchDetail = async () => {
    try {
      setIsLoading(true);
      if (!id) return;
      const data = await getInspectionDetail(parseInt(id));
      setDetail(data);
      
      // Auto-select top risk zone if available
      if (data.zones && data.zones.length > 0 && data.inspection.status === 'analyzed') {
        const sorted = [...data.zones].sort((a, b) => b.priority_score - a.priority_score);
        setSelectedZone(sorted[0]);
      } else {
        setSelectedZone(null);
      }
    } catch (err: any) {
      setError(err.message || '점검 정보를 가져오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!id || !detail) return;
    try {
      setIsAnalyzing(true);
      setError(null);
      await analyzeInspection(parseInt(id));
      await fetchDetail(); // Refresh data
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || '분석 실행 도중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleActionClick = (zoneCode: string) => {
    if (!detail) return;
    const zone = detail.zones.find(z => z.zone_code === zoneCode);
    if (zone) {
      setSelectedZone(zone);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="드론 영상 진단 프레임을 렌더링하고 있습니다..." />;
  }

  if (error || !detail) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-sm max-w-2xl mx-auto my-12 font-semibold">
        <h4 className="font-black mb-2 text-rose-800">오류 발생</h4>
        <p>{error}</p>
        <button
          onClick={fetchDetail}
          className="mt-4 px-4 py-2 bg-rose-100 hover:bg-rose-250 text-rose-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
        >
          재시도
        </button>
      </div>
    );
  }

  const { inspection, plant, image_url, thermal_image_url, zones, actions, summary } = detail;
  const isAnalyzed = inspection.status === 'analyzed';

  // Get Top 3 priority actions zone codes for highlighting
  const topActionZoneCodes = actions.slice(0, 3).map(a => a.zone_code);

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Factory className="w-3.5 h-3.5 text-slate-400" />
              {plant.name} ({getPlantTypeLabel(plant.plant_type)})
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(inspection.created_at)}
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">{inspection.title}</h2>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={inspection.status} />
          
          {!isAnalyzed && (
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm tracking-wide shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              {isAnalyzing ? '규칙 엔진 진단 분석 중...' : '진단 분석 실행'}
            </button>
          )}
        </div>
      </div>

      {/* Warning if not analyzed */}
      {!isAnalyzed && (
        <div className="p-5 border border-amber-200 bg-amber-50/50 rounded-2xl flex items-start gap-3 max-w-4xl">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-bounce" />
          <div>
            <h4 className="text-sm font-black text-slate-800">아직 진단이 실행되지 않은 점검 데이터입니다.</h4>
            <p className="text-xs text-slate-500 font-semibold mt-1 leading-relaxed">
              오른쪽 상단의 <strong className="text-amber-600 font-bold">“진단 분석 실행”</strong> 버튼을 클릭하여 규칙 기반 결함 판별 프로세스를 작동시키십시오. 드론 촬영 픽셀 반사값 스캐닝 및 발전 로그 동기화 처리가 진행됩니다.
            </p>
          </div>
        </div>
      )}

      {/* Main interactive grid dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Drone image visualization overlay & CSS Grid */}
        <div className="lg:col-span-2 space-y-6">
          {/* Visual screen card */}
          <div className="border border-slate-200 bg-white rounded-3xl overflow-hidden shadow-xs">
            <div className="bg-slate-50 border-b border-slate-200/80 px-6 py-3.5 flex items-center justify-between">
              <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-brand-600" />
                드론 수집 영상 매핑 뷰어
              </span>
              
              <div className="flex items-center gap-2">
                {selectedZone && (
                  <button
                    type="button"
                    onClick={() => setIsZoomed(!isZoomed)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black border flex items-center gap-1 transition-all cursor-pointer ${
                      isZoomed 
                        ? 'bg-brand-50 border-brand-200 text-brand-700 shadow-2xs' 
                        : 'bg-white border-slate-250 text-slate-650 hover:bg-slate-50'
                    }`}
                  >
                    <span>{isZoomed ? '🔍 전체보기' : `🔍 ${selectedZone.zone_code} 확대`}</span>
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={() => setImageTab('rgb')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    imageTab === 'rgb' 
                      ? 'bg-brand-600 text-white' 
                      : 'bg-slate-100 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  RGB 가시광선
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab('thermal')}
                  disabled={!thermal_image_url}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    !thermal_image_url ? 'opacity-40 cursor-not-allowed' : ''
                  } ${
                    imageTab === 'thermal' 
                      ? 'bg-amber-600 text-white' 
                      : 'bg-slate-100 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  열화상 (Thermal)
                </button>
              </div>
            </div>

            {/* Translucent overlay container on image */}
            <div className="relative aspect-[16/10] bg-slate-100 w-full overflow-hidden flex items-center justify-center">
              {imageTab === 'rgb' ? (
                <img
                  src={image_url}
                  alt="Drone RGB Inspection"
                  style={getZoomStyle()}
                  className="w-full h-full object-cover select-none"
                />
              ) : (
                thermal_image_url ? (
                  <img
                    src={thermal_image_url}
                    alt="Drone Thermal Infrared Inspection"
                    style={getZoomStyle()}
                    className="w-full h-full object-cover select-none animate-fade-in"
                  />
                ) : (
                  <span className="text-slate-500 text-xs">열화상 이미지 소스가 업로드되지 않았습니다.</span>
                )
              )}

              {/* Grid cell overlay coordinate mappings */}
              {isAnalyzed && (
                <div className="absolute inset-0 grid" style={{
                  gridTemplateColumns: `repeat(${inspection.cols}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${inspection.rows}, minmax(0, 1fr))`,
                  ...getZoomStyle()
                }}>
                  {zones.map((zone) => {
                    const isSelected = selectedZone?.id === zone.id;
                    const zoneModules = disabledModules[zone.zone_code] || {};
                    const disabledCount = [1, 2, 3, 4, 5, 6].filter(num => zoneModules[num]).length;
                    const isAllDisabled = disabledCount === 6;
                    const isAnyDisabled = disabledCount > 0 && disabledCount < 6;
                    
                    return (
                      <div
                        key={zone.id}
                        onClick={() => setSelectedZone(zone)}
                        className={`w-full h-full border border-white/10 hover:bg-slate-500/10 transition-all duration-150 cursor-pointer flex flex-col items-center justify-center relative ${
                          isAllDisabled
                            ? 'bg-slate-900/60 border-rose-500/30'
                            : isAnyDisabled
                              ? 'bg-amber-500/20 border-amber-500/30'
                              : isSelected 
                                ? 'bg-brand-500/15 border-brand-500 ring-2 ring-brand-600 z-10' 
                                : ''
                        }`}
                      >
                        <span className={`px-1 py-0.5 rounded text-[7px] font-black ${
                          isAllDisabled
                            ? 'bg-rose-600 text-white shadow-xs'
                            : isAnyDisabled
                              ? 'bg-amber-600 text-white shadow-xs'
                              : isSelected 
                                ? 'bg-brand-650 text-white shadow-xs' 
                                : 'bg-slate-900/70 text-white'
                        }`}>
                          {zone.zone_code}
                          {isAllDisabled && ' (OFF)'}
                          {isAnyDisabled && ` (${disabledCount}/6 OFF)`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Color status grid */}
          <PanelZoneGrid
            zones={zones}
            rows={inspection.rows}
            cols={inspection.cols}
            isAnalyzed={isAnalyzed}
            selectedZone={selectedZone}
            onZoneClick={(zone) => setSelectedZone(zone)}
            topActionZoneCodes={topActionZoneCodes}
          />
        </div>

        {/* Right column: Action list & detailed focus */}
        <div className="space-y-6 flex flex-col">
          {/* Priority List */}
          <div className="border border-slate-200 bg-white rounded-3xl p-6 shadow-xs flex-1">
            <PriorityActionList
              actions={actions}
              onActionClick={handleActionClick}
            />
          </div>

          {/* Selected details */}
          <div className="h-[620px] shrink-0">
            {selectedZone ? (
              <ZoneDetailDrawer
                zone={selectedZone}
                onClose={() => setSelectedZone(null)}
                disabledModules={disabledModules[selectedZone.zone_code] || {}}
                onToggleModule={(num) => handleToggleModule(selectedZone.zone_code, num)}
                onToggleInverter={() => handleToggleInverter(selectedZone.zone_code)}
              />
            ) : (
              <div className="w-full h-full border border-slate-200 bg-slate-50 rounded-3xl p-6 flex flex-col items-center justify-center text-center text-slate-400">
                <Info className="w-8 h-8 mb-2 opacity-40 text-slate-400" />
                <span className="text-xs font-black">선택된 구역 없음</span>
                <span className="text-[10px] font-semibold mt-1 text-slate-400">그리드나 우선순위 리스트에서 구역을 선택하면<br />상세 결함 프로필 차트 및 인버터 제어를 제어할 수 있습니다.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary statistics block */}
      {isAnalyzed && summary && (
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
            <BarChart className="w-4 h-4 text-brand-600" />
            진단 집계 통계
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="border border-slate-200 bg-white rounded-2xl p-4 text-center shadow-2xs">
              <span className="text-[10px] font-black text-slate-400 block mb-1">총 구역 수</span>
              <strong className="text-xl font-black text-slate-800">{summary.total_zones}</strong>
            </div>
            <div className="border border-slate-200 bg-white rounded-2xl p-4 text-center shadow-2xs">
              <span className="text-[10px] font-black text-emerald-500/80 block mb-1">정상 모니터링</span>
              <strong className="text-xl font-black text-emerald-600">{summary.normal_count}</strong>
            </div>
            <div className="border border-slate-200 bg-white rounded-2xl p-4 text-center shadow-2xs">
              <span className="text-[10px] font-black text-amber-500/80 block mb-1">세척 우선</span>
              <strong className="text-xl font-black text-amber-600">{summary.cleaning_priority_count}</strong>
            </div>
            <div className="border border-slate-200 bg-white rounded-2xl p-4 text-center shadow-2xs">
              <span className="text-[10px] font-black text-rose-500/80 block mb-1">정밀점검 필요</span>
              <strong className="text-xl font-black text-rose-600">{summary.inspection_required_count}</strong>
            </div>
            <div className="border border-slate-200 bg-white rounded-2xl p-4 text-center shadow-2xs">
              <span className="text-[10px] font-black text-sky-500/80 block mb-1">강우 후 재확인</span>
              <strong className="text-xl font-black text-sky-600">{summary.wait_for_rain_count}</strong>
            </div>
            <div className="border border-slate-200 bg-white rounded-2xl p-4 text-center shadow-2xs">
              <span className="text-[10px] font-black text-purple-500/80 block mb-1">수리 검토</span>
              <strong className="text-xl font-black text-purple-600">{summary.repair_review_count}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Tabular details list */}
      {isAnalyzed && zones.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-800">구역별 분석 세부 명세</h3>
          <div className="border border-slate-200 bg-white rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-500 font-semibold">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">구역 코드</th>
                    <th className="px-6 py-4">진단 결함 상태</th>
                    <th className="px-6 py-4">추천 유지관리 조치</th>
                    <th className="px-6 py-4">우선순위 점수</th>
                    <th className="px-6 py-4">세부 설명</th>
                    <th className="px-6 py-4 text-right">상세조회</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {zones.map((zone) => {
                    return (
                      <tr
                        key={zone.id}
                        className={`hover:bg-slate-50/50 transition-colors ${
                          selectedZone?.id === zone.id ? 'bg-brand-50/30' : ''
                        }`}
                      >
                        <td className="px-6 py-4 font-black text-slate-800">{zone.zone_code}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={zone.status_label} />
                        </td>
                        <td className="px-6 py-4">
                          <RecommendationBadge label={zone.recommendation_label} />
                        </td>
                        <td className="px-6 py-4 font-black text-slate-750">{formatScore(zone.priority_score)}</td>
                        <td className="px-6 py-4 text-xs font-medium max-w-xs truncate" title={zone.explanation}>
                          {zone.explanation || '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedZone(zone)}
                            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600 transition-colors cursor-pointer"
                          >
                            조회
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification for Remote Control commands */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-slate-900 border border-slate-800 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-fade-in">
          <span className="text-emerald-400 animate-pulse">⚡</span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
};

export default InspectionDetailPage;
