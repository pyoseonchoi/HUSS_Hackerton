import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Zap, User, ArrowRight, Activity } from 'lucide-react';
import type { Plant } from '../types/plant';

import { formatCapacity, getPlantTypeLabel } from '../utils/format';

interface PlantCardProps {
  plant: Plant;
}

const PlantCard: React.FC<PlantCardProps> = ({ plant }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-slate-700/60 hover:shadow-xl hover:shadow-brand-500/5 group flex flex-col justify-between min-h-[220px]">
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full blur-2xl group-hover:bg-brand-500/10 transition-all duration-500"></div>
      
      <div>
        <div className="flex items-start justify-between mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
            {getPlantTypeLabel(plant.plant_type)}
          </span>
          <span className="text-xs text-slate-500">{new Date(plant.created_at).toLocaleDateString()}</span>
        </div>
        
        <h3 className="text-lg font-bold text-slate-200 group-hover:text-brand-300 transition-colors duration-200 mb-4 line-clamp-1">
          {plant.name}
        </h3>
        
        <div className="space-y-2 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="line-clamp-1">{plant.location_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-slate-500 shrink-0" />
            <span>설비용량: <strong className="text-slate-300">{formatCapacity(plant.capacity_kw)}</strong></span>
          </div>
          {plant.owner_name && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500 shrink-0" />
              <span>소유주: <strong className="text-slate-300">{plant.owner_name}</strong></span>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-4">
        <Link
          to={`/inspections/new?plant_id=${plant.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-slate-100 transition-all duration-200"
        >
          <Activity className="w-3.5 h-3.5" />
          점검 업로드
        </Link>
        
        <Link
          to={`/plants/${plant.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors duration-200 group/link"
        >
          상세 보기
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/link:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};

export default PlantCard;
