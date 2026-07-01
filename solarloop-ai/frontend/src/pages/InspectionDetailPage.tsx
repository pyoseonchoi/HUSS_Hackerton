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
      <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm max-w-2xl mx-auto my-12">
        <h4 className="font-bold mb-2">오류 발생</h4>
        <p>{error}</p>
        <button
          onClick={fetchDetail}
          className="mt-4 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold rounded-lg text-xs transition-colors"
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-900">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <Factory className="w-3.5 h-3.5 text-slate-600" />
              {plant.name} ({getPlantTypeLabel(plant.plant_type)})
            </span>
            <span className="text-slate-700">•</span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(inspection.created_at)}
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">{inspection.title}</h2>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={inspection.status} />
          
          {!isAnalyzed && (
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-slate-100 font-bold text-sm tracking-wide shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              {isAnalyzing ? '규칙 엔진 진단 분석 중...' : '진단 분석 실행'}
            </button>
          )}
        </div>
      </div>

      {/* Warning if not analyzed */}
      {!isAnalyzed && (
        <div className="p-5 border border-amber-500/20 bg-amber-500/5 rounded-2xl flex items-start gap-3 max-w-4xl">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-slate-200">아직 진단이 실행되지 않은 점검 데이터입니다.</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              오른쪽 상단의 <strong className="text-amber-400 font-semibold">“진단 분석 실행”</strong> 버튼을 클릭하여 규칙 기반 결함 판별 프로세스를 작동시키십시오. 드론 촬영 픽셀 반사값 스캐닝 및 발전 로그 동기화 처리가 진행됩니다.
            </p>
          </div>
        </div>
      )}

      {/* Main interactive grid dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Drone image visualization overlay & CSS Grid */}
        <div className="lg:col-span-2 space-y-6">
          {/* Visual screen card */}
          <div className="border border-slate-800/80 bg-slate-900/40 rounded-2xl overflow-hidden backdrop-blur-md">
            <div className="bg-slate-950/60 border-b border-slate-800 px-6 py-3.5 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-brand-400" />
                드론 수집 영상 매핑 뷰어
              </span>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setImageTab('rgb')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    imageTab === 'rgb' 
                      ? 'bg-brand-600 text-slate-100' 
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  RGB 가시광선
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab('thermal')}
                  disabled={!thermal_image_url}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    !thermal_image_url ? 'opacity-40 cursor-not-allowed' : ''
                  } ${
                    imageTab === 'thermal' 
                      ? 'bg-amber-600 text-slate-100' 
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  열화상 (Thermal)
                </button>
              </div>
            </div>

            {/* Translucent overlay container on image */}
            <div className="relative aspect-[16/10] bg-slate-950/90 w-full overflow-hidden flex items-center justify-center">
              {imageTab === 'rgb' ? (
                <img
                  src={image_url}
                  alt="Drone RGB Inspection"
                  className="w-full h-full object-cover select-none"
                />
              ) : (
                thermal_image_url ? (
                  <img
                    src={thermal_image_url}
                    alt="Drone Thermal Infrared Inspection"
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
                  gridTemplateRows: `repeat(${inspection.rows}, minmax(0, 1fr))`
                }}>
                  {zones.map((zone) => {
                    const isSelected = selectedZone?.id === zone.id;
                    const style = getStatusStyle(zone.recommendation_label);
                    
                    return (
                      <div
                        key={zone.id}
                        onClick={() => setSelectedZone(zone)}
                        className={`w-full h-full border border-slate-100/10 hover:border-slate-100/40 hover:bg-slate-500/10 transition-all duration-150 cursor-pointer flex items-center justify-center relative ${
                          isSelected ? 'bg-brand-500/15 border-brand-400/80 ring-2 ring-brand-400 z-10' : ''
                        }`}
                      >
                        <span className={`px-1 py-0.5 rounded text-[8px] font-black ${
                          isSelected 
                            ? 'bg-brand-500 text-slate-950' 
                            : 'bg-slate-950/70 text-slate-300'
                        }`}>
                          {zone.zone_code}
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
          <div className="border border-slate-800/80 bg-slate-900/40 rounded-2xl p-6 backdrop-blur-md flex-1">
            <PriorityActionList
              actions={actions}
              onActionClick={handleActionClick}
            />
          </div>

          {/* Selected details */}
          <div className="h-[520px] shrink-0">
            {selectedZone ? (
              <ZoneDetailDrawer
                zone={selectedZone}
                onClose={() => setSelectedZone(null)}
              />
            ) : (
              <div className="w-full h-full border border-slate-800/80 bg-slate-900/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center text-slate-500">
                <Info className="w-8 h-8 mb-2 opacity-40" />
                <span className="text-xs font-semibold">선택된 구역 없음</span>
                <span className="text-[10px] mt-1">그리드나 우선순위 리스트에서 구역을 선택하면<br />상세 결함 프로필 차트를 확인할 수 있습니다.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary statistics block */}
      {isAnalyzed && summary && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-300 flex items-center gap-1.5">
            <BarChart className="w-4 h-4 text-brand-400" />
            진단 집계 통계
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="border border-slate-850 bg-slate-900/30 rounded-xl p-4 text-center">
              <span className="text-[10px] font-bold text-slate-500 block mb-1">총 구역 수</span>
              <strong className="text-xl font-black text-slate-200">{summary.total_zones}</strong>
            </div>
            <div className="border border-slate-850 bg-slate-900/30 rounded-xl p-4 text-center">
              <span className="text-[10px] font-bold text-emerald-500/80 block mb-1">정상 모니터링</span>
              <strong className="text-xl font-black text-emerald-400">{summary.normal_count}</strong>
            </div>
            <div className="border border-slate-850 bg-slate-900/30 rounded-xl p-4 text-center">
              <span className="text-[10px] font-bold text-amber-500/80 block mb-1">세척 우선</span>
              <strong className="text-xl font-black text-amber-400">{summary.cleaning_priority_count}</strong>
            </div>
            <div className="border border-slate-850 bg-slate-900/30 rounded-xl p-4 text-center">
              <span className="text-[10px] font-bold text-rose-500/80 block mb-1">정밀점검 필요</span>
              <strong className="text-xl font-black text-rose-400">{summary.inspection_required_count}</strong>
            </div>
            <div className="border border-slate-850 bg-slate-900/30 rounded-xl p-4 text-center">
              <span className="text-[10px] font-bold text-sky-500/80 block mb-1">강우 후 재확인</span>
              <strong className="text-xl font-black text-sky-400">{summary.wait_for_rain_count}</strong>
            </div>
            <div className="border border-slate-850 bg-slate-900/30 rounded-xl p-4 text-center">
              <span className="text-[10px] font-bold text-purple-500/80 block mb-1">수리 검토</span>
              <strong className="text-xl font-black text-purple-400">{summary.repair_review_count}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Tabular details list */}
      {isAnalyzed && zones.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-300">구역별 분석 세부 명세</h3>
          <div className="border border-slate-800/80 bg-slate-900/40 rounded-2xl overflow-hidden backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">구역 코드</th>
                    <th className="px-6 py-4">진단 결함 상태</th>
                    <th className="px-6 py-4">추천 유지관리 조치</th>
                    <th className="px-6 py-4">우선순위 점수</th>
                    <th className="px-6 py-4">세부 설명</th>
                    <th className="px-6 py-4 text-right">상세조회</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {zones.map((zone) => {
                    const style = getStatusStyle(zone.recommendation_label);
                    
                    return (
                      <tr
                        key={zone.id}
                        className={`hover:bg-slate-800/20 transition-colors ${
                          selectedZone?.id === zone.id ? 'bg-brand-500/5' : ''
                        }`}
                      >
                        <td className="px-6 py-4 font-black text-slate-200">{zone.zone_code}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={zone.status_label} />
                        </td>
                        <td className="px-6 py-4">
                          <RecommendationBadge label={zone.recommendation_label} />
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-300">{formatScore(zone.priority_score)}</td>
                        <td className="px-6 py-4 text-xs max-w-xs truncate" title={zone.explanation}>
                          {zone.explanation || '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedZone(zone)}
                            className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
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
    </div>
  );
};

export default InspectionDetailPage;
