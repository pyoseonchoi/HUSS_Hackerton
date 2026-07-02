import React from 'react';
import { X, AlertTriangle, CheckCircle, Info, Zap } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import type { PanelZone } from '../types/analysis';

import { getStatusStyle, getStatusLabelKor } from '../utils/statusColor';
import { formatScore } from '../utils/format';

interface ZoneDetailDrawerProps {
  zone: PanelZone | null;
  onClose: () => void;
  disabledModules?: Record<number, boolean>;
  onToggleModule?: (moduleNum: number) => void;
  onToggleInverter?: () => void;
}

const ZoneDetailDrawer: React.FC<ZoneDetailDrawerProps> = ({ 
  zone, 
  onClose,
  disabledModules = {},
  onToggleModule,
  onToggleInverter
}) => {
  if (!zone) return null;

  const hasSolar = !!(zone.modules && zone.modules.length > 0);
  const style = getStatusStyle(zone.recommendation_label);

  const chartData = [
    { name: '오염도', score: Math.round(zone.soiling_score * 100) },
    { name: '음영도', score: Math.round(zone.shading_score * 100) },
    { name: '열이상', score: Math.round(zone.thermal_score * 100) },
    { name: '물리손상', score: Math.round(zone.damage_score * 100) },
    { name: '발전손실', score: Math.round(zone.generation_loss_score * 100) }
  ];

  const totalModulesCount = zone.modules ? zone.modules.length : 0;
  const disabledCount = zone.modules 
    ? zone.modules.filter(m => disabledModules[m.module_number]).length 
    : 0;
  const isAllDisabled = totalModulesCount > 0 && disabledCount === totalModulesCount;
  const isAnyDisabled = disabledCount > 0;

  return (
    <div className="w-full bg-white border border-slate-200 rounded-3xl p-6 shadow-xs relative overflow-hidden flex flex-col justify-between h-full overflow-y-auto">
      {/* Glow effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl"></div>
      
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-baseline gap-2">
            <h3 className="text-base font-black text-slate-855">{zone.zone_code} 구역</h3>
            <span className="text-[10px] text-slate-400 font-bold">원격 분석 & 제어</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Priority score card */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/60 mb-6">
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">종합 조치 우선순위</span>
            <div className="text-2xl font-black text-slate-800 mt-1 tracking-tight">
              {hasSolar ? formatScore(zone.priority_score) : 'N/A'}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-black text-slate-400 block mb-1 uppercase tracking-wider">추천 조치</span>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold ${style.badgeBg}`}>
              {style.text}
            </span>
          </div>
        </div>

        {/* Remote Inverter Control Section */}
        {hasSolar ? (
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 mb-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <span className="text-xs font-black text-slate-800 block">모듈별 원격 인버터 제어</span>
                <span className="text-[9px] font-semibold text-slate-450 leading-relaxed">각 모듈 카드를 클릭하여 개별 ON/OFF 가능</span>
              </div>
              {onToggleInverter && (
                <button
                  onClick={onToggleInverter}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black tracking-wide transition-all shadow-xs cursor-pointer active:scale-95 whitespace-nowrap ${
                    isAllDisabled
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-rose-600 hover:bg-rose-500 text-white'
                  }`}
                >
                  {isAllDisabled ? '전체 ON' : '전체 OFF'}
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-2.5 h-2.5 rounded-full ${isAllDisabled ? 'bg-rose-500 animate-pulse' : isAnyDisabled ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
              <span className="text-[10px] font-bold text-slate-700 animate-fade-in">
                인버터 작동 상태:{' '}
                <strong className={isAllDisabled ? 'text-rose-600' : isAnyDisabled ? 'text-amber-600' : 'text-emerald-600'}>
                  {isAllDisabled ? '전체 차단 (OFF)' : isAnyDisabled ? `일부 차단 (${disabledCount}/6)` : '정상 가동 (ON)'}
                </strong>
              </span>
            </div>
            
            {/* Sub-grid of modules within the zone */}
            <div className="pt-3 border-t border-slate-200/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">AI 검출 모듈 세그멘테이션 (원격 제어)</span>
                <span className="text-[9px] font-bold text-rose-500/80 bg-rose-50 px-2 py-0.5 rounded-md">* 이상 검출 모듈만 제어 가능</span>
              </div>
              
              <div className="flex gap-4 items-center">
                {/* SVG Map of the segmented panel layout */}
                <div className="w-1/2 aspect-square bg-slate-955 border border-slate-800 rounded-2xl p-2 relative flex items-center justify-center shadow-inner">
                  <svg viewBox="0 0 100 100" className="w-full h-full select-none">
                    {/* Solar Cell Grid Pattern for realistic PV panel texture */}
                    <defs>
                      <pattern id="solar-grid" width="8" height="8" patternUnits="userSpaceOnUse">
                        <rect width="8" height="8" fill="none" stroke="currentColor" strokeWidth="0.35" className="text-white/15" />
                        <line x1="0" y1="0" x2="8" y2="8" stroke="currentColor" strokeWidth="0.15" className="text-white/5" />
                      </pattern>
                    </defs>
                    
                    {zone.modules?.map((module) => {
                      const modNum = module.module_number;
                      const isModDefect = module.status === 'HOTSPOT';
                      const isModWarning = module.status === 'SOILING';
                      const isModDamage = module.status === 'DAMAGE';
                      const isModShading = module.status === 'SHADING';
                      
                      const hasIssue = isModDefect || isModWarning || isModDamage || isModShading;
                      const isModDisabled = disabledModules[modNum] || false;
                      
                      // Convert normalized coordinates relative to crop [0, 1] to SVG viewBox [0, 100]
                      const points = module.polygon.map(pt => `${pt[0] * 100},${pt[1] * 100}`).join(" ");
                      
                      // Compute centroid for labels
                      const labelX = (module.polygon.reduce((sum, pt) => sum + pt[0], 0) / module.polygon.length) * 100;
                      const labelY = (module.polygon.reduce((sum, pt) => sum + pt[1], 0) / module.polygon.length) * 100;
                      
                      let fillClass = "fill-slate-800/80 stroke-slate-700/60 hover:fill-slate-700/80";
                      let labelColor = "fill-slate-400";
                      
                      if (isModDisabled) {
                        fillClass = "fill-rose-950/80 stroke-rose-500/80 hover:fill-rose-900/85";
                        labelColor = "fill-rose-400";
                      } else if (isModDefect) {
                        fillClass = "fill-rose-600/40 stroke-rose-500 hover:fill-rose-600/60 cursor-pointer animate-pulse";
                        labelColor = "fill-rose-200";
                      } else if (isModWarning) {
                        fillClass = "fill-amber-600/40 stroke-amber-500 hover:fill-amber-600/60 cursor-pointer";
                        labelColor = "fill-amber-200";
                      } else if (isModDamage) {
                        fillClass = "fill-purple-600/40 stroke-purple-500 hover:fill-purple-600/60 cursor-pointer";
                        labelColor = "fill-purple-200";
                      } else if (isModShading) {
                        fillClass = "fill-sky-600/40 stroke-sky-500 hover:fill-sky-600/60 cursor-pointer";
                        labelColor = "fill-sky-200";
                      } else {
                        // Normal
                        fillClass = "fill-emerald-950/40 stroke-emerald-500/40 hover:fill-emerald-900/30";
                        labelColor = "fill-emerald-400/80";
                      }
                      
                      return (
                        <g key={modNum} className="transition-all duration-200">
                          {/* Base color polygon */}
                          <polygon
                            points={points}
                            onClick={() => {
                              if (hasIssue) {
                                onToggleModule && onToggleModule(modNum);
                              } else {
                                alert("안전을 위해 정상 발전 중인 모듈의 차단은 제한됩니다. 결함이 감시된 모듈만 차단할 수 있습니다.");
                              }
                            }}
                            className={`${fillClass} transition-all duration-200 ${hasIssue ? 'cursor-pointer stroke-[1.5]' : 'cursor-not-allowed'}`}
                          />
                          
                          {/* Solar Grid Pattern overlay for PV appearance */}
                          <polygon
                            points={points}
                            fill="url(#solar-grid)"
                            className="pointer-events-none mix-blend-overlay"
                          />
                          
                          <text
                            x={labelX}
                            y={labelY}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="4.5"
                            fontWeight="black"
                            className={`${labelColor} pointer-events-none select-none`}
                          >
                            #{modNum}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
                
                {/* Detailed cards list */}
                <div className="w-1/2 flex flex-col gap-1.5 h-[160px] overflow-y-auto pr-1">
                  {zone.modules?.map((module) => {
                    const modNum = module.module_number;
                    const isModDefect = module.status === 'HOTSPOT';
                    const isModWarning = module.status === 'SOILING';
                    const isModDamage = module.status === 'DAMAGE';
                    const isModShading = module.status === 'SHADING';
                    
                    const hasIssue = isModDefect || isModWarning || isModDamage || isModShading;
                    const isModDisabled = disabledModules[modNum] || false;
                    
                    let statusText = "정상 작동";
                    let statusDesc = `신뢰도 ${(module.confidence * 100).toFixed(0)}%`;
                    let cardStyle = "bg-slate-50 border-slate-200/60 opacity-60";
                    
                    if (isModDisabled) {
                      statusText = "원격 차단 (OFF)";
                      statusDesc = "차단 해제 가능";
                      cardStyle = "bg-rose-50 border-rose-300 text-rose-850 ring-1 ring-rose-500/10";
                    } else if (isModDefect) {
                      statusText = "열화상 이상 (핫스팟)";
                      cardStyle = "bg-rose-50/30 border-rose-300/80 text-rose-700 animate-pulse";
                    } else if (isModWarning) {
                      statusText = "먼지 오염 누적";
                      cardStyle = "bg-amber-50/40 border-amber-300/80 text-amber-700";
                    } else if (isModDamage) {
                      statusText = "물리적 크랙 감지";
                      cardStyle = "bg-purple-50/40 border-purple-300/80 text-purple-700";
                    } else if (isModShading) {
                      statusText = "수목 음영 장애";
                      cardStyle = "bg-sky-50/40 border-sky-300/80 text-sky-700";
                    } else {
                      statusText = "정상 가동";
                      cardStyle = "bg-emerald-50/10 border-emerald-200 text-emerald-800";
                    }
                    
                    return (
                      <div
                        key={modNum}
                        onClick={() => {
                          if (hasIssue) onToggleModule && onToggleModule(modNum);
                        }}
                        className={`p-2 rounded-xl border text-[9px] font-bold transition-all flex flex-col justify-between ${cardStyle} ${
                          hasIssue ? 'cursor-pointer hover:scale-[1.02] active:scale-95 shadow-2xs hover:border-slate-350' : 'cursor-not-allowed select-none'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-0.5">
                          <span>모듈 #{modNum}</span>
                          <span className="text-[7px] opacity-70">{statusDesc}</span>
                        </div>
                        <div className="text-[8px] font-black truncate">{statusText}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 text-center flex flex-col items-center justify-center min-h-[220px] mb-6">
            <div className="w-12 h-12 rounded-full bg-slate-200/60 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <span className="text-xs font-black text-slate-800 block mb-1">설치 모듈 없음 (AI 분석 제외)</span>
            <span className="text-[9px] text-slate-450 font-semibold max-w-[190px] leading-relaxed">
              이 구역({zone.zone_code})은 태양광 패널이 존재하지 않는 빈 공간(옥상 바닥 또는 공터)으로 자동 분류되어 정밀 진단 및 원격 제어에서 제외되었습니다.
            </span>
          </div>
        )}

        {/* Diagnostic breakdown chart */}
        {hasSolar ? (
          <div className="mb-6">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-brand-600" />
              다차원 결함 위험 프로필
            </h4>
            <div className="w-full h-48 flex items-center justify-center bg-slate-50/50 border border-slate-200/60 rounded-2xl py-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="name" stroke="#64748b" fontSize={9} tick={{ fontWeight: 'bold' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" fontSize={8} />
                  <Radar
                    name={zone.zone_code}
                    dataKey="score"
                    stroke="#0284c7"
                    fill="#0ea5e9"
                    fillOpacity={0.25}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl text-center text-[10px] font-bold text-slate-450 mb-6">
            이 구역은 태양광 모듈이 존재하지 않아 상세 진단 그래프를 제공하지 않습니다.
          </div>
        )}

        {/* Status detail */}
        <div className="space-y-4 mb-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/50">
            <span className="text-xs text-slate-400 font-bold block mb-1">진단 상태 분류</span>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${zone.status_label === 'NORMAL' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              <span className="text-sm font-bold text-slate-800">{getStatusLabelKor(zone.status_label)}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/50">
            <span className="text-xs text-slate-400 font-bold block mb-1">진단 분석 및 추천 근거</span>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              {zone.explanation || '특별한 결함 위험 징후가 보고되지 않았습니다.'}
            </p>
          </div>
        </div>
      </div>

      {/* Guide Card */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex gap-3 text-xs leading-relaxed text-slate-500 font-medium mt-4">
        <Info className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
        <p>본 구역 진단은 드론 RGB 반사율 분석 및 {zone.thermal_score > 0 ? '열화상 캘리브레이션,' : ''} 발전 손실 모델을 결합한 실시간 진단 결과입니다.</p>
      </div>
    </div>
  );
};

export default ZoneDetailDrawer;
