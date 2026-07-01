import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ScanLine, ChevronLeft } from 'lucide-react';
import { getPlants } from '../api/plants';
import { createInspection } from '../api/inspections';
import type { Plant } from '../types/plant';

import UploadForm from '../components/UploadForm';
import LoadingSpinner from '../components/LoadingSpinner';

const InspectionUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoadingPlants, setIsLoadingPlants] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryPlantId = searchParams.get('plant_id');
  const initialPlantId = queryPlantId ? parseInt(queryPlantId) : undefined;

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    try {
      setIsLoadingPlants(true);
      const data = await getPlants();
      setPlants(data);
    } catch (err: any) {
      setError(err.message || '발전소 목록 데이터를 불러오지 못했습니다.');
    } finally {
      setIsLoadingPlants(false);
    }
  };

  const handleUploadSubmit = async (formData: FormData) => {
    setIsUploading(true);
    setError(null);
    try {
      const response = await createInspection(formData);
      // Navigate to the newly created inspection page
      navigate(`/inspections/${response.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || '파일 업로드 과정에서 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoadingPlants) {
    return <LoadingSpinner message="업로드 폼 셋업을 위해 발전소 자산 정보를 로드 중입니다..." />;
  }

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
          <h2 className="text-xl font-bold text-slate-200">새 드론점검 데이터 업로드</h2>
          <p className="text-xs text-slate-500">지정된 발전소에 매핑할 래스터 이미지 및 CSV/JSON 센서 로그를 업로드합니다.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm max-w-3xl mx-auto">
          {error}
        </div>
      )}

      {plants.length === 0 ? (
        <div className="max-w-2xl mx-auto border border-slate-800/80 bg-slate-900/40 p-12 rounded-2xl text-center backdrop-blur-md">
          <ScanLine className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-200 mb-2">등록된 태양광 발전소가 없습니다</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">
            드론 점검 데이터를 업로드하려면 먼저 발전소 시설이 등록되어 있어야 합니다.
          </p>
          <button
            onClick={() => navigate('/plants/new')}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-slate-100 font-bold text-xs transition-colors"
          >
            발전소 먼저 등록하기
          </button>
        </div>
      ) : (
        <UploadForm
          plants={plants}
          initialPlantId={initialPlantId}
          onSubmit={handleUploadSubmit}
          isLoading={isUploading}
        />
      )}
    </div>
  );
};

export default InspectionUploadPage;
