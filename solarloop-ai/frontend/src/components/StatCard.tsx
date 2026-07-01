import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: string;
  trendIsPositive?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  trendIsPositive = true
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-slate-700/60 hover:shadow-lg hover:shadow-brand-500/5 group">
      {/* Decorative gradient background glow on hover */}
      <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl transition-all duration-500 group-hover:bg-brand-500/10"></div>
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-400">{title}</span>
        <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40 text-brand-400 group-hover:text-brand-300 group-hover:bg-brand-500/10 transition-colors duration-300">
          {icon}
        </div>
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-slate-100 tracking-tight">{value}</span>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            trendIsPositive 
              ? 'bg-emerald-500/10 text-emerald-400' 
              : 'bg-rose-500/10 text-rose-400'
          }`}>
            {trend}
          </span>
        )}
      </div>
      
      {description && (
        <p className="mt-2 text-xs text-slate-400 leading-relaxed">{description}</p>
      )}
    </div>
  );
};

export default StatCard;
