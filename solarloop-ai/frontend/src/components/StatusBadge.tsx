import React from 'react';
import { getStatusLabelKor } from '../utils/statusColor';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let bgClass = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  let text = status;

  if (status === 'uploaded') {
    bgClass = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    text = '업로드됨';
  } else if (status === 'analyzed') {
    bgClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    text = '분석 완료';
  } else if (status === 'failed') {
    bgClass = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    text = '분석 실패';
  } else {
    // Maybe zone status label
    text = getStatusLabelKor(status);
    if (status === 'NORMAL') {
      bgClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    } else if (status === 'SOILING') {
      bgClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    } else if (status === 'SHADING') {
      bgClass = 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    } else if (status === 'THERMAL_ANOMALY') {
      bgClass = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    } else if (status === 'PHYSICAL_DAMAGE_SUSPECTED') {
      bgClass = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    } else if (status === 'GENERATION_LOSS_SUSPECTED') {
      bgClass = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bgClass}`}>
      {text}
    </span>
  );
};

export default StatusBadge;
