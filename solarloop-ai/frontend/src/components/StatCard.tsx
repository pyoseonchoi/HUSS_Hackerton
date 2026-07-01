import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  description?: string;
  trend?: string;
  isWarning?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  description,
  trend,
  isWarning = false
}) => {
  return (
    <div className={`relative overflow-hidden rounded-3xl border p-6 transition-all duration-300 hover:shadow-md group bg-white ${
      isWarning ? 'border-amber-200 hover:border-amber-300' : 'border-slate-200 hover:border-slate-350'
    }`}>
      {/* Decorative gradient background glow on hover */}
      <div className={`absolute -right-10 -bottom-10 w-32 h-32 rounded-full blur-2xl transition-all duration-500 ${
        isWarning ? 'bg-amber-500/5 group-hover:bg-amber-500/10' : 'bg-brand-500/5 group-hover:bg-brand-500/10'
      }`}></div>
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-black text-slate-400 tracking-wider uppercase">{title}</span>
        <div className={`p-2.5 rounded-xl border transition-colors duration-300 ${
          isWarning
            ? 'bg-amber-50 border-amber-100 text-amber-600 group-hover:bg-amber-500 group-hover:text-white'
            : 'bg-brand-50 border-brand-100 text-brand-600 group-hover:bg-brand-600 group-hover:text-white'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-black text-slate-800 tracking-tight">{value}</span>
        {unit && <span className="text-sm font-bold text-slate-500">{unit}</span>}
      </div>
      
      <div className="flex items-center justify-between gap-2 mt-3.5 pt-3.5 border-t border-slate-100">
        {description && (
          <p className="text-[11px] text-slate-400 font-semibold leading-none">{description}</p>
        )}
        {trend && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
            isWarning 
              ? 'bg-amber-50 text-amber-600 border border-amber-100' 
              : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
          }`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;

