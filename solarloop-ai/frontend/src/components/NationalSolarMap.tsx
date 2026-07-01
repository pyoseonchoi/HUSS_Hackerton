import React, { useState, useMemo } from 'react';
import type { Plant } from '../types/plant';
import { Sun, ShieldAlert, Zap, MapPin } from 'lucide-react';

interface NationalSolarMapProps {
  plants: Plant[];
}

interface RegionData {
  id: string;
  name: string;
  count: number;
  capacity: number;
  path: string;
  center: { x: number; y: number };
}

const NationalSolarMap: React.FC<NationalSolarMapProps> = ({ plants }) => {
  const [hoveredRegion, setHoveredRegion] = useState<RegionData | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Map plants to region based on location string
  const regionStats = useMemo(() => {
    const stats: Record<string, { count: number; capacity: number }> = {
      gyeonggi: { count: 0, capacity: 0 },
      gangwon: { count: 0, capacity: 0 },
      chungcheong: { count: 0, capacity: 0 },
      jeolla: { count: 0, capacity: 0 },
      gyeongsang: { count: 0, capacity: 0 },
      jeju: { count: 0, capacity: 0 },
    };

    plants.forEach((plant) => {
      const loc = (plant.location_name || plant.location || '').toLowerCase();
      if (loc.includes('경기') || loc.includes('서울') || loc.includes('인천') || loc.includes('수도권')) {
        stats.gyeonggi.count += 1;
        stats.gyeonggi.capacity += plant.capacity_kw;
      } else if (loc.includes('강원')) {
        stats.gangwon.count += 1;
        stats.gangwon.capacity += plant.capacity_kw;
      } else if (loc.includes('충청') || loc.includes('대전') || loc.includes('세종') || loc.includes('충북') || loc.includes('충남')) {
        stats.chungcheong.count += 1;
        stats.chungcheong.capacity += plant.capacity_kw;
      } else if (loc.includes('전라') || loc.includes('광주') || loc.includes('전북') || loc.includes('전남')) {
        stats.jeolla.count += 1;
        stats.jeolla.capacity += plant.capacity_kw;
      } else if (loc.includes('경상') || loc.includes('대구') || loc.includes('부산') || loc.includes('울산') || loc.includes('경북') || loc.includes('경남')) {
        stats.gyeongsang.count += 1;
        stats.gyeongsang.capacity += plant.capacity_kw;
      } else if (loc.includes('제주')) {
        stats.jeju.count += 1;
        stats.jeju.capacity += plant.capacity_kw;
      } else {
        // Fallback to Gyeonggi as default mock mapping
        stats.gyeonggi.count += 1;
        stats.gyeonggi.capacity += plant.capacity_kw;
      }
    });

    return stats;
  }, [plants]);

  // Clean, stylized SVG paths for 대한민국 권역 경계 (Simplified Minimal Map)
  const regions: RegionData[] = [
    {
      id: 'gyeonggi',
      name: '수도권/경기',
      count: regionStats.gyeonggi.count,
      capacity: regionStats.gyeonggi.capacity,
      // Stylized paths on a 300x400 canvas
      path: 'M 100,60 L 140,65 L 140,110 L 95,115 L 75,95 Z',
      center: { x: 110, y: 85 },
    },
    {
      id: 'gangwon',
      name: '강원권',
      count: regionStats.gangwon.count,
      capacity: regionStats.gangwon.capacity,
      path: 'M 140,65 L 220,70 L 220,115 L 175,145 L 140,110 Z',
      center: { x: 175, y: 95 },
    },
    {
      id: 'chungcheong',
      name: '충청권',
      count: regionStats.chungcheong.count,
      capacity: regionStats.chungcheong.capacity,
      path: 'M 95,115 L 140,110 L 175,145 L 160,200 L 90,185 L 85,145 Z',
      center: { x: 125, y: 155 },
    },
    {
      id: 'jeolla',
      name: '호남권/전라',
      count: regionStats.jeolla.count,
      capacity: regionStats.jeolla.capacity,
      path: 'M 90,185 L 160,200 L 140,285 L 80,290 L 70,225 Z',
      center: { x: 110, y: 240 },
    },
    {
      id: 'gyeongsang',
      name: '영남권/경상',
      count: regionStats.gyeongsang.count,
      capacity: regionStats.gyeongsang.capacity,
      path: 'M 160,200 L 235,175 L 245,260 L 210,280 L 140,285 Z',
      center: { x: 190, y: 235 },
    },
    {
      id: 'jeju',
      name: '제주도',
      count: regionStats.jeju.count,
      capacity: regionStats.jeju.capacity,
      path: 'M 85,340 L 125,340 L 120,360 L 80,360 Z',
      center: { x: 102, y: 350 },
    },
  ];

  const handleMouseMove = (e: React.MouseEvent, region: RegionData) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mapContainer = e.currentTarget.closest('.map-relative-container');
    if (mapContainer) {
      const containerRect = mapContainer.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - containerRect.left + 12,
        y: e.clientY - containerRect.top + 12,
      });
    }
    setHoveredRegion(region);
  };

  const totalCapacity = plants.reduce((sum, p) => sum + p.capacity_kw, 0);

  return (
    <div className="w-full border border-slate-200/80 bg-white rounded-3xl p-6 shadow-xs relative map-relative-container">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none rounded-3xl" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Left text pane */}
        <div className="lg:col-span-4 flex flex-col justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold mb-3 border border-brand-100/50">
              <Sun className="w-3.5 h-3.5" />
              실시간 전국 가동 통계
            </span>
            <h3 className="text-xl font-black text-slate-800 tracking-tight leading-snug">
              전국 태양광 발전소<br />
              자산 관제 현황
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              등록된 드론 수집 데이터를 기반으로 대한민국 권역별 노후도, 오염 상태 및 손실 누적량을 집계하여 실시간 의사결정을 지원합니다.
            </p>
          </div>

          <div className="mt-8 lg:mt-0 space-y-4">
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 block tracking-wider uppercase">총 가동 발전소</span>
                <strong className="text-2xl font-black text-slate-800 mt-0.5 block">{plants.length}개소</strong>
              </div>
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shadow-2xs">
                <Sun className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 block tracking-wider uppercase">총 운영 설비 용량</span>
                <strong className="text-2xl font-black text-slate-800 mt-0.5 block">
                  {totalCapacity >= 1000 ? `${(totalCapacity / 1000).toFixed(1)} MW` : `${totalCapacity} kW`}
                </strong>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs">
                <Zap className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Right SVG Map Pane */}
        <div className="lg:col-span-8 flex justify-center items-center">
          <div className="relative w-full max-w-[360px] h-[400px] flex items-center justify-center">
            <svg
              viewBox="0 0 300 400"
              className="w-full h-full drop-shadow-[0_8px_24px_rgba(148,163,184,0.12)]"
            >
              {/* Map Regions */}
              <g>
                {regions.map((region) => {
                  const isHovered = hoveredRegion?.id === region.id;
                  const hasActivePlants = region.count > 0;
                  
                  return (
                    <path
                      key={region.id}
                      d={region.path}
                      onMouseMove={(e) => handleMouseMove(e, region)}
                      onMouseLeave={() => setHoveredRegion(null)}
                      className={`transition-all duration-300 cursor-pointer ${
                        isHovered
                          ? 'fill-brand-100 stroke-brand-400 stroke-[2.5px]'
                          : hasActivePlants
                            ? 'fill-brand-50/40 stroke-slate-200/90 stroke-2'
                            : 'fill-slate-100/70 stroke-slate-200 stroke-1.5'
                      }`}
                    />
                  );
                })}
              </g>

              {/* Glowing Pulse Indicators for regions with active plants */}
              <g className="pointer-events-none">
                {regions.map((region) => {
                  if (region.count === 0) return null;
                  const isHovered = hoveredRegion?.id === region.id;

                  return (
                    <g key={`marker-${region.id}`} transform={`translate(${region.center.x}, ${region.center.y})`}>
                      {/* Pulse Circle */}
                      <circle
                        r="8"
                        className="fill-brand-500 opacity-20 animate-ping"
                      />
                      {/* Inner Circle */}
                      <circle
                        r="4"
                        className={`transition-all duration-300 ${
                          isHovered ? 'fill-brand-600 r-6' : 'fill-brand-500'
                        }`}
                      />
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Region Label Tags */}
            <div className="absolute top-2 right-2 space-y-1.5 bg-slate-50/80 border border-slate-200/50 backdrop-blur-xs rounded-xl p-3 text-[10px] text-slate-500 shadow-2xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-500 inline-block" />
                <span>운영 중인 발전소 구역</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block" />
                <span>미등록 구역</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredRegion && (
        <div
          className="absolute z-40 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-md pointer-events-none animate-fade-in"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
        >
          <div className="flex items-center gap-1 text-slate-400 font-bold text-[10px] tracking-wide mb-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            {hoveredRegion.name}
          </div>
          <h4 className="text-sm font-black text-slate-800">{hoveredRegion.name} 가동 현황</h4>
          <div className="mt-2.5 space-y-1.5">
            <div className="flex items-center justify-between gap-6 text-xs">
              <span className="text-slate-500 font-medium">등록 발전소 수:</span>
              <strong className="text-slate-800 font-bold">{hoveredRegion.count}개소</strong>
            </div>
            <div className="flex items-center justify-between gap-6 text-xs">
              <span className="text-slate-500 font-medium">총 설비 용량:</span>
              <strong className="text-brand-600 font-black">
                {hoveredRegion.capacity >= 1000 
                  ? `${(hoveredRegion.capacity / 1000).toFixed(1)} MW` 
                  : `${hoveredRegion.capacity} kW`}
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NationalSolarMap;
