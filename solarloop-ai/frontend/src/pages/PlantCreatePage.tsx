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
          className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-black text-slate-800">신규 태양광 발전소 등록</h2>
          <p className="text-xs text-slate-400 font-semibold">신규 유지보수 대상 발전소 설비 정보를 생성합니다.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-650 text-sm font-semibold max-w-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl border border-slate-200 bg-white p-8 rounded-3xl space-y-6 shadow-xs">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-6">
          <Factory className="w-5 h-5 text-brand-600" />
          <span className="text-sm font-black text-slate-800">발전소 기본 시설물 속성</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plant Name */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="text-sm font-bold text-slate-500">발전소 명칭</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 경북대 공공건물 옥상 태양광"
              required
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 font-semibold focus:outline-none focus:border-brand-600 transition-colors shadow-2xs"
            />
          </div>

          {/* Location Name */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500">설치 위치 (주소)</label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="예: 대구 북구 대학로 80"
              required
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 font-semibold focus:outline-none focus:border-brand-600 transition-colors shadow-2xs"
            />
          </div>

          {/* Plant Type */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500">설비 유형</label>
            <select
              value={plantType}
              onChange={(e) => setPlantType(e.target.value)}
              required
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-semibold focus:outline-none focus:border-brand-600 transition-colors shadow-2xs cursor-pointer"
            >
              <option value="rooftop">옥상 태양광 (Rooftop)</option>
              <option value="ground">지상형 태양광 (Ground)</option>
              <option value="factory_roof">공장 지붕 태양광 (Factory Roof)</option>
              <option value="public_building">공공건물 태양광 (Public Building)</option>
            </select>
          </div>

          {/* Capacity kW */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500">설비용량 (kW)</label>
            <input
              type="number"
              step="any"
              value={capacityKw}
              onChange={(e) => setCapacityKw(e.target.value)}
              placeholder="예: 50.0"
              required
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 font-semibold focus:outline-none focus:border-brand-600 transition-colors shadow-2xs"
            />
          </div>

          {/* Owner Name */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500">담당자 / 소유주 명칭</label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="예: 시설관리 주임"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 font-semibold focus:outline-none focus:border-brand-600 transition-colors shadow-2xs"
            />
          </div>

          {/* Latitude */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500">설치 위도 (Latitude)</label>
            <input
              type="text"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              required
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-semibold focus:outline-none focus:border-brand-600 transition-colors shadow-2xs"
            />
          </div>

          {/* Longitude */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500">설치 경도 (Longitude)</label>
            <input
              type="text"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              required
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-semibold focus:outline-none focus:border-brand-600 transition-colors shadow-2xs"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/plants')}
            className="px-5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 font-bold transition-colors cursor-pointer"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
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
