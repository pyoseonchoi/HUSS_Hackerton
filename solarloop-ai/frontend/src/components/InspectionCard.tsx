import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, LayoutGrid, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Inspection } from '../types/inspection';

import { formatDate } from '../utils/format';
import StatusBadge from './StatusBadge';

interface InspectionCardProps {
  inspection: Inspection & { plant_name?: string };
}

const InspectionCard: React.FC<InspectionCardProps> = ({ inspection }) => {
  const isAnalyzed = inspection.status === 'analyzed';
  
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-slate-700/60 hover:shadow-xl hover:shadow-brand-500/5 group flex flex-col justify-between min-h-[200px]">
      <div>
        <div className="flex items-start justify-between mb-3">
          <StatusBadge status={inspection.status} />
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(inspection.created_at)}</span>
          </div>
        </div>
        
        {inspection.plant_name && (
          <span className="text-xs font-semibold text-brand-400 tracking-wide block mb-1">
            {inspection.plant_name}
          </span>
        )}
        
        <h3 className="text-base font-bold text-slate-200 group-hover:text-brand-300 transition-colors duration-200 line-clamp-1 mb-4">
          {inspection.title}
        </h3>
        
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />
            <span>구역 레이아웃: <strong className="text-slate-300">{inspection.rows} x {inspection.cols}</strong></span>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
        <span className="text-xs text-slate-500 flex items-center gap-1">
          {isAnalyzed ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-500 font-medium">진단 분석 완료</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span className="text-amber-500 font-medium">대기 중 (분석 실행 필요)</span>
            </>
          )}
        </span>
        
        <Link
          to={`/inspections/${inspection.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors duration-200 group/link"
        >
          진단 대시보드
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/link:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};

export default InspectionCard;
