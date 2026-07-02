import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Zap, User, Activity, BarChart2, ShieldAlert, ShieldCheck, AlertTriangle, ArrowRight } from 'lucide-react';
import type { Plant } from '../types/plant';

import { formatCapacity, getPlantTypeLabel } from '../utils/format';

interface PlantCardProps {
  plant: Plant;
}

const getPlantStatus = (plant: Plant): 'critical' | 'warning' | 'normal' => {
  if (plant.status) return plant.status;
  if (!plant.anomaly_count || plant.anomaly_count === 0) return 'normal';
  const action = plant.latest_action || '';
  if (action.includes('정밀점검') || action.includes('수리') || action.includes('긴급')) return 'critical';
  return 'warning';
};

const PlantCard: React.FC<PlantCardProps> = ({ plant }) => {
  const navigate = useNavigate();
  const status = getPlantStatus(plant);

  const statusConfig = {
    critical: {
      borderColor: 'border-rose-200 hover:border-rose-300',
      dotColor: 'bg-rose-500',
      badgeBg: 'bg-rose-50 text-rose-600 border-rose-100',
      badgeText: '심각 — 정밀점검 필요',
      accentBg: 'bg-rose-500/5 group-hover:bg-rose-500/10',
      icon: ShieldAlert,
      iconColor: 'text-rose-500',
    },
    warning: {
      borderColor: 'border-amber-200 hover:border-amber-300',
      dotColor: 'bg-amber-500',
      badgeBg: 'bg-amber-50 text-amber-600 border-amber-100',
      badgeText: '주의 — 세척/재확인',
      accentBg: 'bg-amber-500/5 group-hover:bg-amber-500/10',
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
    },
    normal: {
      borderColor: 'border-slate-200 hover:border-slate-300',
      dotColor: 'bg-emerald-500',
      badgeBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      badgeText: '안전 가동',
      accentBg: 'bg-brand-500/5 group-hover:bg-brand-500/10',
      icon: ShieldCheck,
      iconColor: 'text-emerald-500',
    },
  };

  const cfg = statusConfig[status];
  const StatusIcon = cfg.icon;

  const handleCardClick = () => {
    if (plant.latest_inspection_id) {
      navigate(`/inspections/${plant.latest_inspection_id}`);
    } else {
      navigate(`/inspections/new?plant_id=${plant.id}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`relative overflow-hidden rounded-3xl border bg-white p-6 transition-all duration-300 hover:shadow-md group flex flex-col justify-between min-h-[250px] cursor-pointer ${cfg.borderColor}`}
    >
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl transition-all duration-500 ${cfg.accentBg}`}></div>
      
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-600 border border-brand-100/50">
              {getPlantTypeLabel(plant.plant_type)}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.badgeBg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor} ${status === 'critical' ? 'animate-pulse' : ''}`} />
              {cfg.badgeText}
            </span>
          </div>
        </div>
        
        <h3 className="text-base font-black text-slate-800 group-hover:text-brand-600 transition-colors duration-200 mb-4 line-clamp-1">
          {plant.name}
        </h3>
        
        <div className="space-y-2 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="line-clamp-1">{plant.location_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-slate-400 shrink-0" />
            <span>설비용량: <strong className="text-slate-800 font-bold">{formatCapacity(plant.capacity_kw)}</strong></span>
          </div>
          {plant.owner_name && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <span>소유주: <strong className="text-slate-800 font-bold">{plant.owner_name}</strong></span>
            </div>
          )}
        </div>

        {/* Anomaly summary for non-normal plants */}
        {status !== 'normal' && plant.latest_action && (
          <div className={`mt-3 text-[10px] font-bold px-2.5 py-1.5 rounded-xl border leading-relaxed line-clamp-2 ${
            status === 'critical'
              ? 'bg-rose-50/70 border-rose-100 text-rose-700'
              : 'bg-amber-50/70 border-amber-100 text-amber-700'
          }`}>
            <StatusIcon className="w-3 h-3 inline mr-1 -mt-0.5" />
            {plant.latest_action}
          </div>
        )}
      </div>
      
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/inspections/new?plant_id=${plant.id}`);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-150 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-all duration-200 cursor-pointer"
        >
          <Activity className="w-3.5 h-3.5 text-slate-500" />
          신규 점검
        </button>
        
        <span
          className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 group-hover:text-brand-500 transition-colors duration-200"
        >
          {plant.latest_inspection_id ? 'AI 정밀 진단' : '점검 등록'}
          <ArrowRight className="w-3.5 h-3.5 text-brand-600 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>
    </div>
  );
};

export default PlantCard;
