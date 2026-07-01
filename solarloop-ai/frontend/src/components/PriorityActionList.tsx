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
      <div className="border border-slate-200 bg-white rounded-3xl p-8 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-3 text-emerald-600">
          <Award className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-black text-slate-800 mb-1">모든 패널 정상 작동</h4>
        <p className="text-xs text-slate-400 font-semibold leading-relaxed">
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
        <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-amber-500 animate-pulse" />
          오늘의 관리 우선순위
        </h3>
        <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
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
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-slate-350 hover:bg-slate-50 cursor-pointer flex gap-3.5 shadow-2xs"
            >
              {/* Left rank indicator with themed color badge */}
              <div className="flex flex-col items-center justify-center shrink-0 w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 font-black text-slate-500 text-sm group-hover:bg-brand-600 group-hover:text-white group-hover:border-brand-600 transition-all">
                {action.priority_rank}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-black text-slate-800 group-hover:text-brand-600 transition-colors">
                      {action.zone_code}
                    </span>
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${style.badgeBg}`}>
                      {style.text}
                    </span>
                  </div>
                  
                  {action.expected_recovery_kwh && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shrink-0">
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      +{formatPower(action.expected_recovery_kwh)} 복구
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 font-semibold leading-relaxed group-hover:text-slate-700 transition-colors">
                  {action.reason}
                </p>

                <div className="mt-2.5 flex items-center justify-end text-[10px] font-bold text-slate-400 group-hover:text-brand-600 transition-colors gap-0.5">
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
