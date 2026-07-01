export interface StatusStyle {
  text: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  badgeBg: string;
}

export const getStatusStyle = (label: string): StatusStyle => {
  switch (label) {
    case 'NORMAL_MONITORING':
      return {
        text: '정상 모니터링',
        bgClass: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30',
        borderClass: 'border-emerald-500',
        textClass: 'text-emerald-400',
        badgeBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
      };
    case 'CLEANING_PRIORITY':
      return {
        text: '세척 우선',
        bgClass: 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30',
        borderClass: 'border-amber-500',
        textClass: 'text-amber-400',
        badgeBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
      };
    case 'INSPECTION_REQUIRED':
      return {
        text: '정밀점검 필요',
        bgClass: 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30',
        borderClass: 'border-rose-500',
        textClass: 'text-rose-400',
        badgeBg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
      };
    case 'WAIT_FOR_RAIN':
      return {
        text: '강우 후 재확인',
        bgClass: 'bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/30',
        borderClass: 'border-sky-500',
        textClass: 'text-sky-400',
        badgeBg: 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
      };
    case 'REPAIR_REVIEW':
      return {
        text: '수리 검토',
        bgClass: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30',
        borderClass: 'border-purple-500',
        textClass: 'text-purple-400',
        badgeBg: 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
      };
    default:
      return {
        text: '기타 상태',
        bgClass: 'bg-slate-500/10 hover:bg-slate-500/20 border-slate-500/30',
        borderClass: 'border-slate-500',
        textClass: 'text-slate-400',
        badgeBg: 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
      };
  }
};

export const getStatusLabelKor = (status: string): string => {
  switch (status) {
    case 'NORMAL': return '정상';
    case 'SOILING': return '표면 오염';
    case 'SHADING': return '구역 음영';
    case 'THERMAL_ANOMALY': return '열 이상';
    case 'PHYSICAL_DAMAGE_SUSPECTED': return '물리적 손상 의심';
    case 'GENERATION_LOSS_SUSPECTED': return '발전 손실 감지';
    default: return status;
  }
};
