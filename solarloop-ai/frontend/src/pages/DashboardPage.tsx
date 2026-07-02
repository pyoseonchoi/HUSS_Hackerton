import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Factory, Eye, Plus, AlertTriangle, ShieldCheck, TrendingUp, Zap, BarChart3, Settings, Play } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getDashboardSummary, seedDemoData } from '../api/inspections';
import type { DashboardSummary } from '../api/inspections';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import NationalSolarMap from '../components/NationalSolarMap';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setIsLoading(true);
      const data = await getDashboardSummary();
      setSummary(data);
    } catch (err: any) {
      setError(err.message || '대시보드 데이터를 가져오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="솔라루프 대시보드를 구축하고 있습니다..." />;
  }

  // Pre-process chart data
  const chartData = summary?.capacity_by_type.map(item => {
    const typeKey = item.plant_type.toLowerCase();
    const name = typeKey === 'rooftop' ? '지붕형'
      : typeKey === 'ground' ? '지상형'
      : typeKey === 'public_building' ? '공공시설형'
      : '수상형';
    return { name, '용량 (kW)': item.total_capacity };
  }) || [];

  return (
    <div className="space-y-8">
      {/* Banner / Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">태양광 유지관리 관제 센터</h2>
          <p className="text-xs text-slate-500 mt-1 leading-normal">
            드론 촬영 이미지 분석 결과와 발전 통계를 종합하여 패널 노후화 상태를 실시간 진단합니다.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* 1. National Map and Assets Overview (User Requirement) */}
      {summary && summary.recent_plants.length > 0 ? (
        <NationalSolarMap plants={summary.recent_plants} />
      ) : (
        <div className="border border-slate-200/85 bg-white rounded-3xl p-8 text-center text-slate-500 shadow-xs">
          <p className="text-xs font-semibold">등록된 태양광 발전소가 없습니다.</p>
          <p className="text-[11px] text-slate-400 mt-1">
            상단의 '신규 발전소 등록' 메뉴를 통해 발전소 자산을 생성하십시오.
          </p>
        </div>
      )}

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="총 관리 발전소"
          value={summary?.total_plants || 0}
          unit="개소"
          icon={Factory}
          description="자산 관제 하에 운영 중"
          trend="정상 작동 중"
        />
        <StatCard
          title="누적 점검 건수"
          value={summary?.total_inspections || 0}
          unit="건"
          icon={Eye}
          description="드론 영상 기반 전수 진단"
          trend="실시간 업데이트"
        />
        <StatCard
          title="발전 손실 감지"
          value={summary?.total_anomaly_zones || 0}
          unit="구역"
          icon={AlertTriangle}
          description="세척/수리 권장 셀 리스트"
          trend="조치 요구됨"
          isWarning={true}
        />
        <StatCard
          title="안전 가동율"
          value={summary && summary.total_zones_count > 0 
            ? Math.round(((summary.total_zones_count - summary.total_anomaly_zones) / summary.total_zones_count) * 100)
            : 100
          }
          unit="%"
          icon={ShieldCheck}
          description="전체 패널 진단 대비 정상율"
          trend="양호"
        />
      </div>

      {/* 2.5 Management Priority Alert Panel */}
      {summary && summary.recent_plants.length > 0 && (() => {
        const getPlantStatus = (plant: any): 'critical' | 'warning' | 'normal' => {
          if (plant.status) return plant.status;
          if (!plant.anomaly_count || plant.anomaly_count === 0) return 'normal';
          const action = plant.latest_action || '';
          if (action.includes('정밀점검') || action.includes('수리') || action.includes('긴급')) return 'critical';
          return 'warning';
        };

        const priorityPlants = [...summary.recent_plants]
          .map(p => ({ ...p, _status: getPlantStatus(p) }))
          .filter(p => p._status !== 'normal')
          .sort((a, b) => {
            const order = { critical: 0, warning: 1, normal: 2 };
            if (order[a._status] !== order[b._status]) return order[a._status] - order[b._status];
            return (b.anomaly_count || 0) - (a.anomaly_count || 0);
          })
          .slice(0, 5);

        if (priorityPlants.length === 0) return null;

        return (
          <div className="border border-slate-200/80 bg-white rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
                관리 우선순위 발전소
              </h3>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                총 {priorityPlants.length}개소 조치 필요
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {priorityPlants.map((plant, idx) => {
                const isCritical = plant._status === 'critical';
                return (
                  <button
                    key={plant.id}
                    onClick={() => {
                      if (plant.latest_inspection_id) {
                        navigate(`/inspections/${plant.latest_inspection_id}`);
                      }
                    }}
                    className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer hover:shadow-md active:scale-[0.98] ${
                      isCritical
                        ? 'border-rose-200 bg-rose-50/50 hover:border-rose-300 hover:bg-rose-50'
                        : 'border-amber-200 bg-amber-50/50 hover:border-amber-300 hover:bg-amber-50'
                    }`}
                  >
                    {/* Rank badge */}
                    <div className={`absolute top-2.5 right-2.5 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                      isCritical
                        ? 'bg-rose-500 text-white'
                        : 'bg-amber-500 text-white'
                    }`}>
                      {idx + 1}
                    </div>

                    {/* Status dot */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        isCritical ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'
                      }`} />
                      <span className={`text-[9px] font-black uppercase tracking-wider ${
                        isCritical ? 'text-rose-500' : 'text-amber-600'
                      }`}>
                        {isCritical ? '심각' : '주의'}
                      </span>
                    </div>

                    <h4 className={`text-xs font-black leading-tight mb-1 line-clamp-1 transition-colors ${
                      isCritical
                        ? 'text-rose-800 group-hover:text-rose-600'
                        : 'text-amber-800 group-hover:text-amber-600'
                    }`}>
                      {plant.name}
                    </h4>

                    <p className="text-[10px] text-slate-500 font-semibold line-clamp-1 mb-2">
                      {plant.location_name}
                    </p>

                    <div className={`text-[10px] font-bold px-2 py-1 rounded-lg border leading-relaxed line-clamp-2 ${
                      isCritical
                        ? 'bg-rose-100/60 border-rose-200/60 text-rose-700'
                        : 'bg-amber-100/60 border-amber-200/60 text-amber-700'
                    }`}>
                      {plant.latest_action || '이상 구역 감지됨'}
                    </div>

                    <div className={`mt-2.5 text-[9px] font-bold flex items-center gap-0.5 transition-colors ${
                      isCritical
                        ? 'text-rose-400 group-hover:text-rose-600'
                        : 'text-amber-400 group-hover:text-amber-600'
                    }`}>
                      상세 보고서 보기 →
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* 3. Under Table and Bar Charts split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recent Inspections */}
        <div className="lg:col-span-8 border border-slate-200/80 bg-white rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-brand-500" />
                최근 드론 영상 진단 현황
              </h3>
              <Link to="/plants" className="text-[11px] font-bold text-brand-600 hover:text-brand-500">
                더보기
              </Link>
            </div>

            {summary && summary.recent_inspections.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-500">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">점검 타질</th>
                      <th className="px-4 py-3">발전소명</th>
                      <th className="px-4 py-3">진단 구역</th>
                      <th className="px-4 py-3">분석 상태</th>
                      <th className="px-4 py-3 text-right">상세</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {summary.recent_inspections.slice(0, 5).map((ins) => {
                      const pl = summary.recent_plants.find(p => p.id === ins.plant_id);
                      return (
                        <tr key={ins.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-bold text-slate-800">{ins.title}</td>
                          <td className="px-4 py-3 text-slate-500">{pl?.name || '-'}</td>
                          <td className="px-4 py-3">{ins.rows} × {ins.cols} ({ins.rows * ins.cols}구역)</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                              ins.status === 'analyzed' 
                                ? 'bg-emerald-50 text-emerald-600'
                                : ins.status === 'failed'
                                  ? 'bg-rose-50 text-rose-600'
                                  : 'bg-amber-50 text-amber-600'
                            }`}>
                              {ins.status === 'analyzed' ? '분석 완료' : ins.status === 'failed' ? '실패' : '대기 중'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => navigate(`/inspections/${ins.id}`)}
                              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-600 transition-colors cursor-pointer"
                            >
                              관제
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                진단 이력이 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Plant Type capacity Chart */}
        <div className="lg:col-span-4 border border-slate-200/80 bg-white rounded-3xl p-6 shadow-xs flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-6">
            <TrendingUp className="w-4 h-4 text-brand-500" />
            설비 유형별 용량 비율
          </h3>

          <div className="flex-1 min-h-[220px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderRadius: '12px', 
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
                    }} 
                    labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                  />
                  <Bar dataKey="용량 (kW)" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index % 3 === 0 ? '#0284c7' : index % 3 === 1 ? '#0d9488' : '#f59e0b'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                차트 시각화 데이터가 부족합니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
