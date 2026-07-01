import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Factory, Search } from 'lucide-react';
import { getPlants } from '../api/plants';
import type { Plant } from '../types/plant';
import PlantCard from '../components/PlantCard';

import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const PlantListPage: React.FC = () => {
  const navigate = useNavigate();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<Plant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    try {
      setIsLoading(true);
      const data = await getPlants();
      setPlants(data);
      setFilteredPlants(data);
    } catch (err: any) {
      setError(err.message || '발전소 목록을 가져오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (!q.trim()) {
      setFilteredPlants(plants);
    } else {
      const filtered = plants.filter((p) =>
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.location_name.toLowerCase().includes(q.toLowerCase())
      );
      setFilteredPlants(filtered);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="등록된 발전소 목록을 스캔하고 있습니다..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
            <Factory className="w-5 h-5 text-brand-400" />
            태양광 발전소 관리 목록
          </h2>
          <p className="text-xs text-slate-500 mt-1">AI 정밀 진단을 진행할 발전소 시설물을 관리 및 등록합니다.</p>
        </div>

        <button
          onClick={() => navigate('/plants/new')}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-slate-100 font-bold text-sm tracking-wide shadow-md transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          신규 발전소 등록
        </button>
      </div>

      {/* Search filter */}
      {plants.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="발전소명 또는 위치 검색..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 focus:bg-slate-950 transition-all"
          />
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* Grid rendering */}
      {filteredPlants.length === 0 ? (
        <EmptyState
          title={searchQuery ? "검색 결과가 없습니다" : "등록된 발전소가 없습니다"}
          description={searchQuery ? "검색어를 확인한 뒤 다시 시도해 주세요." : "첫 번째 발전소를 등록하여 드론 패널 진단을 진행해 보세요."}
          actionButton={
            <button
              onClick={() => navigate('/plants/new')}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-slate-100 font-bold text-xs transition-colors"
            >
              신규 발전소 등록
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlants.map((plant) => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlantListPage;
