import React, { useState } from 'react';
import { Upload, FileText, Image as ImageIcon, Sun, AlertTriangle } from 'lucide-react';
import type { Plant } from '../types/plant';


interface UploadFormProps {
  plants: Plant[];
  initialPlantId?: number;
  onSubmit: (formData: FormData) => void;
  isLoading: boolean;
}

const UploadForm: React.FC<UploadFormProps> = ({ plants, initialPlantId, onSubmit, isLoading }) => {
  const [plantId, setPlantId] = useState<string>(initialPlantId?.toString() || '');
  const [title, setTitle] = useState('');
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(6);
  
  const [rgbFile, setRgbFile] = useState<File | null>(null);
  const [thermalFile, setThermalFile] = useState<File | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void,
    allowedExtensions: string[]
  ) => {
    setError(null);
    const file = e.target.files?.[0] || null;
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !allowedExtensions.includes(ext)) {
        setError(`허용되지 않는 파일 형식입니다. (.${allowedExtensions.join(', .')} 형식만 지원)`);
        e.target.value = ''; // reset input
        setFile(null);
        return;
      }
      setFile(file);
    } else {
      setFile(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!plantId) {
      setError('태양광 발전소를 선택해 주세요.');
      return;
    }
    if (!title.trim()) {
      setError('점검 명칭을 입력해 주세요.');
      return;
    }
    if (!rgbFile) {
      setError('드론 RGB 이미지는 필수 업로드 항목입니다.');
      return;
    }
    if (rows < 1 || cols < 1) {
      setError('그리드 크기는 최소 1x1 이상이어야 합니다.');
      return;
    }

    const formData = new FormData();
    formData.append('plant_id', plantId);
    formData.append('title', title);
    formData.append('rows', rows.toString());
    formData.append('cols', cols.toString());
    formData.append('rgb_image', rgbFile);
    
    if (thermalFile) formData.append('thermal_image', thermalFile);
    if (csvFile) formData.append('generation_csv', csvFile);
    if (jsonFile) formData.append('weather_json', jsonFile);

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto border border-slate-200 bg-white p-8 rounded-3xl shadow-xs">
      <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
        <Upload className="w-5 h-5 text-brand-600" />
        신규 드론 자율점검 정보 업로드
      </h2>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Plant select */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">태양광 발전소 선택</label>
          <select
            value={plantId}
            onChange={(e) => setPlantId(e.target.value)}
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-semibold focus:outline-none focus:bg-white focus:border-brand-500 transition-all cursor-pointer"
          >
            <option value="">-- 발전소 선택 --</option>
            {plants.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({formatCapacity(p.capacity_kw)})</option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">점검 명칭</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 2026년 상반기 정기 드론 점검"
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-brand-500 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rows */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">패널 세로 구역 수 (Rows)</label>
          <input
            type="number"
            min={1}
            max={20}
            value={rows}
            onChange={(e) => setRows(parseInt(e.target.value) || 0)}
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-semibold focus:outline-none focus:bg-white focus:border-brand-500 transition-all"
          />
        </div>

        {/* Cols */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">패널 가로 구역 수 (Columns)</label>
          <input
            type="number"
            min={1}
            max={20}
            value={cols}
            onChange={(e) => setCols(parseInt(e.target.value) || 0)}
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-semibold focus:outline-none focus:bg-white focus:border-brand-500 transition-all"
          />
        </div>
      </div>

      <div className="border-t border-slate-100 my-8 pt-6">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4">입력 데이터 소스 업로드</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* RGB image (Required) */}
          <div className="p-5 border border-dashed border-slate-200 bg-slate-50/50 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-white transition-colors">
            <ImageIcon className="w-8 h-8 text-brand-600 mb-2" />
            <span className="text-xs font-bold text-slate-700 mb-1">드론 RGB 촬영 이미지 (필수)</span>
            <span className="text-[10px] text-slate-400 mb-3">지원 형식: .jpg, .jpeg, .png</span>
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              required
              onChange={(e) => handleFileChange(e, setRgbFile, ['jpg', 'jpeg', 'png'])}
              className="text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-bold file:bg-brand-50 file:text-brand-600 hover:file:bg-brand-100 file:cursor-pointer"
            />
            {rgbFile && <p className="text-xs text-emerald-600 mt-2 font-bold">선택됨: {rgbFile.name}</p>}
          </div>

          {/* Thermal image (Optional) */}
          <div className="p-5 border border-dashed border-slate-200 bg-slate-50/50 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-white transition-colors">
            <Sun className="w-8 h-8 text-amber-500 mb-2" />
            <span className="text-xs font-bold text-slate-700 mb-1">열화상(Thermal) 이미지 (선택)</span>
            <span className="text-[10px] text-slate-400 mb-3">지원 형식: .jpg, .jpeg, .png</span>
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={(e) => handleFileChange(e, setThermalFile, ['jpg', 'jpeg', 'png'])}
              className="text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-bold file:bg-amber-50 file:text-amber-600 hover:file:bg-amber-100 file:cursor-pointer"
            />
            {thermalFile && <p className="text-xs text-emerald-600 mt-2 font-bold">선택됨: {thermalFile.name}</p>}
          </div>

          {/* Generation CSV (Optional) */}
          <div className="p-5 border border-dashed border-slate-200 bg-slate-50/50 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-white transition-colors">
            <FileText className="w-8 h-8 text-emerald-500 mb-2" />
            <span className="text-xs font-bold text-slate-700 mb-1">시간별 발전량 CSV 로그 (선택)</span>
            <span className="text-[10px] text-slate-400 mb-3">지원 형식: .csv (expected_kwh, actual_kwh 필수)</span>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileChange(e, setCsvFile, ['csv'])}
              className="text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-bold file:bg-emerald-50 file:text-emerald-600 hover:file:bg-emerald-100 file:cursor-pointer"
            />
            {csvFile && <p className="text-xs text-emerald-600 mt-2 font-bold">선택됨: {csvFile.name}</p>}
          </div>

          {/* Weather JSON (Optional) */}
          <div className="p-5 border border-dashed border-slate-200 bg-slate-50/50 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-white transition-colors">
            <FileText className="w-8 h-8 text-sky-500 mb-2" />
            <span className="text-xs font-bold text-slate-700 mb-1">기상 정보 JSON 메타데이터 (선택)</span>
            <span className="text-[10px] text-slate-400 mb-3">지원 형식: .json (rain_expected_within_24h 포함)</span>
            <input
              type="file"
              accept=".json"
              onChange={(e) => handleFileChange(e, setJsonFile, ['json'])}
              className="text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-bold file:bg-sky-50 file:text-sky-600 hover:file:bg-sky-100 file:cursor-pointer"
            />
            {jsonFile && <p className="text-xs text-emerald-600 mt-2 font-bold">선택됨: {jsonFile.name}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full md:w-auto px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs tracking-wider transition-all disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? '업로드 및 분석 초기화 중...' : '점검 등록 및 파일 전송'}
        </button>
      </div>
    </form>
  );
};

const formatCapacity = (kw: number): string => {
  return `${kw.toLocaleString()} kW`;
};

export default UploadForm;
