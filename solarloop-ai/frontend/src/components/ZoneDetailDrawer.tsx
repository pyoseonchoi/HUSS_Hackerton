import React from 'react';
import { X, AlertTriangle, CheckCircle, Info, Zap } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import type { PanelZone } from '../types/analysis';

import { getStatusStyle, getStatusLabelKor } from '../utils/statusColor';
import { formatScore } from '../utils/format';

interface ZoneDetailDrawerProps {
  zone: PanelZone | null;
  onClose: () => void;
}

const ZoneDetailDrawer: React.FC<ZoneDetailDrawerProps> = ({ zone, onClose }) => {
  if (!zone) return null;

  const style = getStatusStyle(zone.recommendation_label);

  const chartData = [
    { name: '오염도 (Soiling)', score: Math.round(zone.soiling_score * 100) },
    { name: '음영도 (Shading)', score: Math.round(zone.shading_score * 100) },
    { name: '열이상 (Thermal)', score: Math.round(zone.thermal_score * 100) },
    { name: '물리손상 (Damage)', score: Math.round(zone.damage_score * 100) },
    { name: '발전손실 (Loss)', score: Math.round(zone.generation_loss_score * 100) }
  ];

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden flex flex-col justify-between h-full">
      {/* Glow effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl"></div>
      
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
          <div className="flex items-baseline gap-2">
            <h3 className="text-lg font-bold text-slate-200">{zone.zone_code} 구역</h3>
            <span className="text-xs text-slate-500">진단 상세 데이터</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Priority score card */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800 mb-6">
          <div>
            <span className="text-xs text-slate-400 font-medium">유지관리 종합 우선순위 점수</span>
            <div className="text-3xl font-black text-slate-100 mt-1 tracking-tight">
              {formatScore(zone.priority_score)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block mb-1">추천 조치</span>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${style.badgeBg}`}>
              {style.text}
            </span>
          </div>
        </div>

        {/* Diagnostic breakdown chart */}
        <div className="mb-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-brand-400" />
            다차원 결함 위험 프로필
          </h4>
          <div className="w-full h-56 flex items-center justify-center bg-slate-950/20 border border-slate-800/40 rounded-xl py-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} />
                <Radar
                  name={zone.zone_code}
                  dataKey="score"
                  stroke="#38abf8"
                  fill="#0e90e9"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status detail */}
        <div className="space-y-4 mb-6">
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60">
            <span className="text-xs text-slate-500 font-semibold block mb-1">진단 상태 분류</span>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${zone.status_label === 'NORMAL' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              <span className="text-sm font-bold text-slate-300">{getStatusLabelKor(zone.status_label)}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60">
            <span className="text-xs text-slate-500 font-semibold block mb-1">진단 분석 및 추천 근거</span>
            <p className="text-sm text-slate-300 leading-relaxed">
              {zone.explanation || '특별한 결함 위험 징후가 보고되지 않았습니다.'}
            </p>
          </div>
        </div>
      </div>

      {/* Guide Card */}
      <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 flex gap-3 text-xs leading-relaxed text-slate-400">
        <Info className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
        <p>본 구역 진단은 드론 RGB 반사율 분석 및 {zone.thermal_score > 0 ? '열화상 캘리브레이션,' : ''} 발전 손실 모델을 결합한 실시간 진단 결과입니다.</p>
      </div>
    </div>
  );
};

export default ZoneDetailDrawer;
