import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Plant } from '../types/plant';
import { Sun, Zap, ExternalLink, ShieldAlert, Award } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon paths (using dynamic divIcon to avoid asset loading bugs)
const createPlantIcon = (isHovered: boolean, status: 'critical' | 'warning' | 'normal') => {
  let pinColor = 'bg-emerald-500';
  let pulseColor = 'bg-emerald-500/20';
  let hoverColor = 'bg-emerald-600';

  if (status === 'critical') {
    pinColor = 'bg-rose-500';
    pulseColor = 'bg-rose-500/20';
    hoverColor = 'bg-rose-600';
  } else if (status === 'warning') {
    pinColor = 'bg-amber-500';
    pulseColor = 'bg-amber-500/20';
    hoverColor = 'bg-amber-600';
  }

  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 rounded-full ${pulseColor} ${isHovered ? 'animate-ping' : ''}"></div>
        <div class="w-4 h-4 rounded-full ${pinColor} border-2 border-white shadow-md transition-all duration-200 ${isHovered ? 'scale-125 ' + hoverColor : ''}"></div>
      </div>
    `,
    className: 'custom-leaflet-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

interface NationalSolarMapProps {
  plants: Plant[];
}

// Center of South Korea
const MAP_CENTER: [number, number] = [35.907757, 127.766922];

const NationalSolarMap: React.FC<NationalSolarMapProps> = ({ plants }) => {
  const navigate = useNavigate();
  const [activePlantId, setActivePlantId] = useState<number | null>(null);

  const totalCapacity = plants.reduce((sum, p) => sum + p.capacity_kw, 0);

  const handlePlantClick = (plant: Plant) => {
    if (plant.latest_inspection_id) {
      navigate(`/inspections/${plant.latest_inspection_id}`);
    } else {
      navigate(`/inspections/new?plant_id=${plant.id}`);
    }
  };

  return (
    <div className="w-full border border-slate-200/80 bg-white rounded-3xl p-6 shadow-xs relative">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none rounded-3xl" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Left info panel */}
        <div className="lg:col-span-4 flex flex-col justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold mb-3 border border-brand-100/50">
              <Sun className="w-3.5 h-3.5" />
              실시간 전국 자동 관제망
            </span>
            <h3 className="text-xl font-black text-slate-800 tracking-tight leading-snug">
              자율 비행 드론<br />
              실시간 원격 진단 지도
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              지도를 자유롭게 확대/축소하여 각 태양광 발전소의 실시간 상태와 정확한 지리적 위치를 조회할 수 있습니다. 마커를 클릭하면 상세 팝업이 표시되며, 상세 뷰어로 이동하여 드론 점검 리스트를 바로 분석할 수 있습니다.
            </p>
          </div>

          <div className="mt-8 lg:mt-0 space-y-4">
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 block tracking-wider uppercase">총 관제 발전소</span>
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

        {/* Right Interactive Leaflet Map Pane */}
        <div className="lg:col-span-8 relative">
          <div className="w-full h-[420px] rounded-2xl border border-slate-200 overflow-hidden shadow-inner relative z-20">
            {/* Map Legend Overlay */}
            <div className="absolute top-4 right-4 z-[1000] bg-white/95 border border-slate-200/80 backdrop-blur-xs rounded-xl p-3 shadow-md text-[10px] text-slate-655 font-semibold space-y-1.5 pointer-events-auto">
              <div className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-0.5">
                지도 마커 구분
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 border border-white inline-block shadow-2xs" />
                <span>심각 지역 (정밀점검/수리 필요)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 border border-white inline-block shadow-2xs" />
                <span>오류 구역 (세척/재확인 필요)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white inline-block shadow-2xs" />
                <span>안전 가동 (문제 없음)</span>
              </div>
            </div>

            <MapContainer
              center={MAP_CENTER}
              zoom={7}
              scrollWheelZoom={true}
              className="w-full h-full"
            >
              {/* Premium, minimal grayscale map style (CartoDB Positron) */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />

              {/* Markers for each plant */}
              {plants.map((plant) => {
                const hasCoordinates = plant.latitude && plant.longitude;
                if (!hasCoordinates) return null;

                const isHovered = activePlantId === plant.id;
                
                // Helper to get status with robust fallback
                const getStatus = (): 'critical' | 'warning' | 'normal' => {
                  if (plant.status) return plant.status;
                  if (!plant.anomaly_count || plant.anomaly_count === 0) return 'normal';
                  const action = plant.latest_action || '';
                  if (action.includes('정밀점검') || action.includes('수리') || action.includes('긴급')) {
                    return 'critical';
                  }
                  return 'warning';
                };

                const status = getStatus();

                return (
                  <Marker
                    key={`leaflet-marker-${plant.id}`}
                    position={[plant.latitude, plant.longitude]}
                    icon={createPlantIcon(isHovered, status)}
                    eventHandlers={{
                      mouseover: () => setActivePlantId(plant.id),
                      mouseout: () => setActivePlantId(null),
                      click: () => {
                        setActivePlantId(plant.id);
                      }
                    }}
                  >
                    <Popup 
                      className="custom-popup"
                      minWidth={250}
                      maxWidth={280}
                    >
                      <div className="p-0.5 text-slate-800 w-[240px]">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                            status === 'critical' 
                              ? 'text-rose-600 bg-rose-50 border-rose-100'
                              : status === 'warning'
                                ? 'text-amber-600 bg-amber-50 border-amber-100'
                                : 'text-emerald-600 bg-emerald-50 border-emerald-100'
                          }`}>
                            {status === 'critical' ? '조치 필요 (심각)' : status === 'warning' ? '주의 요함 (오류)' : '안전 가동'}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400">
                            ID #{plant.id}
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-slate-800 m-0 leading-tight">
                          {plant.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 m-0 mt-0.5 leading-normal">
                          {plant.location_name}
                        </p>
                        
                        {/* Real-time operational details inside the popup */}
                        <div className="mt-2 pt-1.5 border-t border-slate-100 space-y-0.5 text-[11px] text-slate-655 font-semibold">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 font-medium">실시간 출력:</span>
                            <span className="text-slate-800 font-bold">
                              {plant.current_output_kw ?? 0} / {plant.capacity_kw} kW
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 font-medium">가동 효율:</span>
                            <span className={`font-bold ${
                              (plant.efficiency_pct ?? 100) >= 80 ? 'text-emerald-600' : 'text-amber-600'
                            }`}>
                              {plant.efficiency_pct ?? 100}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 font-medium">드론 결함 셀:</span>
                            <span className={`font-bold flex items-center gap-0.5 ${
                              status === 'critical' ? 'text-rose-500' : status === 'warning' ? 'text-amber-500' : 'text-emerald-600'
                            }`}>
                              {status !== 'normal' ? <ShieldAlert className="w-3 h-3 inline shrink-0" /> : <Award className="w-3 h-3 inline shrink-0" />}
                              {plant.anomaly_count ?? 0} / {plant.total_zones ?? 24} 구역
                            </span>
                          </div>
                          
                          {/* Recommended action recommendation */}
                          {(plant.latest_action && status !== 'normal') && (
                            <div className={`mt-1.5 p-1.5 rounded-lg border text-[10px] leading-relaxed font-medium ${
                              status === 'critical'
                                ? 'bg-rose-50 border-rose-100/50 text-rose-700'
                                : 'bg-amber-50 border-amber-100/50 text-amber-700'
                            }`}>
                              <strong className={`block text-[8px] uppercase tracking-wider font-black mb-0.5 ${
                                status === 'critical' ? 'text-rose-500' : 'text-amber-500'
                              }`}>
                                최우선 조치 제언
                              </strong>
                              {plant.latest_action}
                            </div>
                          )}
                        </div>

                        {/* Dedicated Interactive Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlantClick(plant);
                          }}
                          className="mt-2.5 w-full flex items-center justify-center gap-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold transition-all duration-150 cursor-pointer shadow-xs active:scale-[0.98]"
                        >
                          <ExternalLink className="w-3 h-3" />
                          상세 뷰어로 이동
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NationalSolarMap;
