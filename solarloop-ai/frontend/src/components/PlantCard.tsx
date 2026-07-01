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
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:border-slate-300 hover:shadow-md group flex flex-col justify-between min-h-[220px]">
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full blur-2xl group-hover:bg-brand-500/10 transition-all duration-500"></div>
      
      <div>
        <div className="flex items-start justify-between mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-600 border border-brand-100/50">
            {getPlantTypeLabel(plant.plant_type)}
          </span>
          <span className="text-[10px] font-bold text-slate-400">{new Date(plant.created_at).toLocaleDateString()}</span>
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
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
        <Link
          to={`/inspections/new?plant_id=${plant.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white transition-all duration-200 cursor-pointer"
        >
          <Activity className="w-3.5 h-3.5" />
          점검 업로드
        </Link>
        
        <Link
          to={`/plants/${plant.id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-500 transition-colors duration-200 group/link cursor-pointer"
        >
          상세 보기
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/link:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};

export default PlantCard;
