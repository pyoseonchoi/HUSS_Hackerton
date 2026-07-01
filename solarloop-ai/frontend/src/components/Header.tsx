import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Factory, PlusCircle, ScanLine, Sun, CloudRain } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: '대시보드', icon: LayoutGrid },
    { path: '/plants', label: '발전소 목록', icon: Factory },
    { path: '/plants/new', label: '신규 발전소 등록', icon: PlusCircle },
    { path: '/inspections/new', label: '신규 드론점검 등록', icon: ScanLine },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 border-b border-slate-200/85 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm group-hover:bg-brand-500 transition-colors">
                <Sun className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                  SolarLoop <span className="text-brand-600 font-medium">AI</span>
                </h1>
                <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase -mt-1">
                  Solar Maintenance
                </p>
              </div>
            </Link>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex space-x-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-50 text-brand-600 shadow-2xs border border-brand-100/50'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Section: Global Status Ticker */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-3 bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-1 font-semibold">
                <CloudRain className="w-3.5 h-3.5 text-slate-400" />
                <span>강수 없음 (24h)</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1 font-semibold">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>920 W/m²</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                System Active
              </span>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation Tickers */}
        <div className="md:hidden flex overflow-x-auto py-2 -mx-4 px-4 gap-1.5 border-t border-slate-100 scrollbar-none">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold shrink-0 transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default Header;
