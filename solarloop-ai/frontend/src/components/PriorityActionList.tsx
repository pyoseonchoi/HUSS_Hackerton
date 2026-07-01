import React from 'react';
import { Award, Zap, AlertCircle, ArrowRight } from 'lucide-react';
import type { MaintenanceAction } from '../types/analysis';

import { getStatusStyle } from '../utils/statusColor';
import { formatPower } from '../utils/format';

interface PriorityActionListProps {
  actions: MaintenanceAction[];
  onActionClick?: (zoneCode: string) => void;
}

const PriorityActionList: React.FC<PriorityActionListProps> = ({ actions, onActionClick }) => {
  if (actions.length === 0) {
    return (
      <div className="border border-slate-800 bg-slate-900/40 rounded-2xl p-8 text-center backdrop-blur-md">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mx-auto mb-3 text-emerald-400">
          <Award className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-200 mb-1">모든 패널 정상 작동</h4>
        <p className="text-xs text-slate-500 leading-relaxed">
          유지관리가 필요한 이상 구역이 없습니다.<br />정기 모니터링만 지속하십시오.
        </p>
      </div>
    );
  }

  // Get Top 3 actions to highlight
  const displayActions = actions.slice(0, 10); // Display up to top 10

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-slate-300 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          오늘의 관리 우선순위
        </h3>
        <span className="text-[10px] font-semibold text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/30">
          총 {actions.length}건
        </span>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
        {displayActions.map((action) => {
          const style = getStatusStyle(action.action_type);
          
          return (
            <div
              key={action.id}
              onClick={() => onActionClick?.(action.zone_code)}
              className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/30 p-4 transition-all duration-200 hover:border-slate-700/60 hover:bg-slate-900/50 cursor-pointer flex gap-3.5"
            >
              {/* Left rank indicator with themed color badge */}
              <div className="flex flex-col items-center justify-center shrink-0 w-8 h-8 rounded-lg bg-slate-950/60 border border-slate-800/80 font-black text-slate-300 text-sm group-hover:text-brand-300 transition-colors">
                {action.priority_rank}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-black text-slate-200 group-hover:text-slate-100 transition-colors">
                      {action.zone_code}
                    </span>
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${style.badgeBg}`}>
                      {style.text}
                    </span>
                  </div>
                  
                  {action.expected_recovery_kwh && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0">
                      <Zap className="w-3 h-3 fill-current" />
                      +{formatPower(action.expected_recovery_kwh)} 복구예상
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                  {action.reason}
                </p>

                <div className="mt-2.5 flex items-center justify-end text-[10px] font-semibold text-slate-500 group-hover:text-brand-400 transition-colors gap-0.5">
                  그리드에서 셀 보기
                  <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PriorityActionList;
