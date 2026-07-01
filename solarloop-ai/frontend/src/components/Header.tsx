import React from 'react';
import { Sun, CloudRain, Bell, ShieldCheck, Wifi } from 'lucide-react';

const Header: React.FC = () => {
  const today = new Date();
  const dateString = today.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  });

  return (
    <header className="h-16 bg-slate-950/40 border-b border-slate-800/80 px-8 flex items-center justify-between backdrop-blur-md shrink-0">
      <div className="flex items-center gap-6">
        <div className="text-xs font-semibold text-slate-400">
          {dateString}
        </div>
        
        {/* Real-time system monitoring signals */}
        <div className="hidden sm:flex items-center gap-3">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
            <Wifi className="w-3 h-3" />
            Edge Connected
          </span>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded">
            <ShieldCheck className="w-3 h-3" />
            AI Node: Active
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Weather quick stats */}
        <div className="flex items-center gap-3 border-r border-slate-800/80 pr-4 text-xs font-bold text-slate-400">
          <div className="flex items-center gap-1" title="Solar Radiation Info">
            <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
            <span>920 W/m²</span>
          </div>
          <div className="flex items-center gap-1" title="Precipitation Status">
            <CloudRain className="w-4 h-4 text-sky-400" />
            <span>강수 없음</span>
          </div>
        </div>

        {/* Notifications and Profile */}
        <button
          type="button"
          className="relative p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500"></span>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-amber-500 p-0.5 shadow">
            <div className="w-full h-full rounded-[6px] bg-slate-900 flex items-center justify-center text-[11px] font-black text-brand-300">
              AD
            </div>
          </div>
          <div className="hidden md:block text-left">
            <span className="text-xs font-bold text-slate-300 block leading-none">관리자 계정</span>
            <span className="text-[9px] text-slate-500 mt-0.5 block leading-none">admin@solarloop.ai</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
