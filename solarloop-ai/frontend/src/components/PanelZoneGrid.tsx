import React from 'react';
import type { PanelZone } from '../types/analysis';

import { getStatusStyle } from '../utils/statusColor';

interface PanelZoneGridProps {
  zones: PanelZone[];
  rows: number;
  cols: number;
  isAnalyzed: boolean;
  selectedZone: PanelZone | null;
  onZoneClick: (zone: PanelZone) => void;
  topActionZoneCodes?: string[];
}

const PanelZoneGrid: React.FC<PanelZoneGridProps> = ({
  zones,
  rows,
  cols,
  isAnalyzed,
  selectedZone,
  onZoneClick,
  topActionZoneCodes = []
}) => {
  // Safe sorting to ensure grid indices correspond correctly
  const sortedZones = [...zones].sort((a, b) => {
    if (a.row_index !== b.row_index) {
      return a.row_index - b.row_index;
    }
    return a.col_index - b.col_index;
  });

  return (
    <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-300">태양광 패널 구역 상태 그리드 ({rows} x {cols})</h3>
        {isAnalyzed && (
          <span className="text-xs text-slate-500 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            셀 클릭 시 상세 점수 및 가이드 확인 가능
          </span>
        )}
      </div>

      <div
        className="grid gap-2 w-full aspect-[4/3] md:aspect-[16/10] overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
        }}
      >
        {sortedZones.map((zone) => {
          const style = getStatusStyle(zone.recommendation_label);
          const isSelected = selectedZone?.id === zone.id;
          const isTopAction = topActionZoneCodes.includes(zone.zone_code);
          
          if (!isAnalyzed) {
            return (
              <button
                key={zone.id}
                type="button"
                disabled
                className="w-full h-full flex flex-col items-center justify-center border border-slate-800 bg-slate-900/30 text-slate-600 rounded-xl cursor-not-allowed"
              >
                <span className="text-xs md:text-sm font-bold">{zone.zone_code}</span>
                <span className="text-[9px] mt-1 font-semibold tracking-wider opacity-60">대기</span>
              </button>
            );
          }

          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => onZoneClick(zone)}
              className={`w-full h-full flex flex-col items-center justify-center p-1 border rounded-xl transition-all duration-200 relative group outline-none ${
                style.bgClass
              } ${
                isSelected 
                  ? 'ring-2 ring-brand-400 border-transparent scale-[1.02] z-10 shadow-lg shadow-brand-500/10' 
                  : 'hover:scale-[1.01]'
              }`}
            >
              {/* Highlight badge for Top-3 actions */}
              {isTopAction && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border border-slate-950 animate-ping"></span>
              )}
              {isTopAction && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border border-slate-950"></span>
              )}

              <span className={`text-[10px] md:text-xs font-bold leading-none ${style.textClass} opacity-80 group-hover:opacity-100 transition-opacity`}>
                {zone.zone_code}
              </span>
              <span className="text-sm md:text-lg font-black tracking-tight text-slate-100 mt-0.5">
                {Math.round(zone.priority_score)}
              </span>
              <span className="text-[8px] md:text-[9px] font-semibold text-slate-400 mt-0.5 line-clamp-1 max-w-full">
                {style.text}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Legend */}
      {isAnalyzed && (
        <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(['NORMAL_MONITORING', 'CLEANING_PRIORITY', 'WAIT_FOR_RAIN', 'INSPECTION_REQUIRED', 'REPAIR_REVIEW'] as const).map((lbl) => {
            const style = getStatusStyle(lbl);
            return (
              <div key={lbl} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/50 border border-slate-800/40">
                <span className={`w-3 h-3 rounded-md shrink-0 ${style.badgeBg.split(' ')[0]} border ${style.badgeBg.split(' ').slice(2).join(' ')}`}></span>
                <span className="text-xs font-medium text-slate-400 leading-none">{style.text}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PanelZoneGrid;
