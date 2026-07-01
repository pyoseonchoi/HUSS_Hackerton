import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Factory, ChevronLeft, Save } from 'lucide-react';
import { createPlant } from '../api/plants';

const PlantCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState('35.888');
  const [longitude, setLongitude] = useState('128.61');
  const [plantType, setPlantType] = useState('rooftop');
  const [capacityKw, setCapacityKw] = useState('');
  const [ownerName, setOwnerName] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const cap = parseFloat(capacityKw);
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(cap) || cap <= 0) {
        throw new Error('설비용량은 0보다 큰 숫자여야 합니다.');
      }
      if (isNaN(lat) || isNaN(lng)) {
        throw new Error('위도와 경도는 올바른 숫자 좌표여야 합니다.');
      }

      await createPlant({
        name,
        location_name: locationName,
        latitude: lat,
        longitude: lng,
        plant_type: plantType as any,
        capacity_kw: cap,
        owner_name: ownerName || undefined
      });

      navigate('/plants');
    } catch (err: any) {
      setError(err.message || '발전소 등록에 실패했습니다. 입력값을 확인해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-200">신규 태양광 발전소 등록</h2>
          <p className="text-xs text-slate-500">신규 유지보수 대상 발전소 설비 정보를 생성합니다.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm max-w-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl border border-slate-800/80 bg-slate-900/40 p-8 rounded-2xl backdrop-blur-md space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-800/80 mb-6">
          <Factory className="w-5 h-5 text-brand-400" />
          <span className="text-sm font-bold text-slate-300">발전소 기본 시설물 속성</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plant Name */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="text-sm font-medium text-slate-400">발전소 명칭</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 경북대 공공건물 옥상 태양광"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          {/* Location Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">설치 위치 (주소)</label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="예: 대구 북구 대학로 80"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          {/* Plant Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">설비 유형</label>
            <select
              value={plantType}
              onChange={(e) => setPlantType(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:border-brand-500 transition-colors"
            >
              <option value="rooftop">옥상 태양광 (Rooftop)</option>
              <option value="ground">지상형 태양광 (Ground)</option>
              <option value="factory_roof">공장 지붕 태양광 (Factory Roof)</option>
              <option value="public_building">공공건물 태양광 (Public Building)</option>
            </select>
          </div>

          {/* Capacity kW */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">설비용량 (kW)</label>
            <input
              type="number"
              step="any"
              value={capacityKw}
              onChange={(e) => setCapacityKw(e.target.value)}
              placeholder="예: 50.0"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          {/* Owner Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">담당자 / 소유주 명칭</label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="예: 시설관리 주임"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          {/* Latitude */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">설치 위도 (Latitude)</label>
            <input
              type="text"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          {/* Longitude */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">설치 경도 (Longitude)</label>
            <input
              type="text"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => navigate('/plants')}
            className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 font-bold transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-slate-100 font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isLoading ? '등록 중...' : '저장 완료'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlantCreatePage;
