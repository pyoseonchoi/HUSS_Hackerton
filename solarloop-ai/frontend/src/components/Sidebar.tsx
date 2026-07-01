import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Factory, PlusCircle, ScanLine, Activity } from 'lucide-react';

const Sidebar: React.FC = () => {
  const menuItems = [
    { name: '대시보드', path: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: '발전소 목록', path: '/plants', icon: <Factory className="w-5 h-5" /> },
    { name: '신규 발전소 등록', path: '/plants/new', icon: <PlusCircle className="w-5 h-5" /> },
    { name: '신규 드론점검 등록', path: '/inspections/new', icon: <ScanLine className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 shrink-0 bg-slate-950/80 border-r border-slate-800/80 flex flex-col justify-between p-6 backdrop-blur-md">
      <div>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-2 py-4 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Activity className="w-5 h-5 text-slate-100 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-100 tracking-wider">SolarLoop AI</h1>
            <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Maintenance MVP</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-brand-600/15 text-brand-400 border border-brand-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`
              }
            >
              <span className="transition-transform duration-200 group-hover:scale-105">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 text-center">
        <span className="text-[10px] font-bold text-slate-400 block mb-1">SolarLoop Control Hub</span>
        <span className="text-[9px] text-slate-500 block">v1.2.0 (Stable)</span>
      </div>
    </aside>
  );
};

export default Sidebar;
