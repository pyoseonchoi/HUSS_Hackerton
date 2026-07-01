import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Factory, Eye, Plus, AlertTriangle, ShieldCheck, TrendingUp, Zap, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getDashboardSummary, seedDemoData } from '../api/inspections';
import type { DashboardSummary } from '../api/inspections';

import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatDate } from '../utils/format';
import StatusBadge from '../components/StatusBadge';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const data = await getDashboardSummary();
      setStats(data);
    } catch (err: any) {
      setError(err.message || '통계 정보를 불러오는 과정에서 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDemo = async () => {
    try {
      setIsSeeding(true);
      const res = await seedDemoData();
      // Redirect to newly created inspection detail page
      navigate(`/inspections/${res.inspection_id}`);
    } catch (err: any) {
      alert(`데모 생성 실패: ${err.response?.data?.detail || err.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="SolarLoop AI 대시보드 분석 정보를 생성 중입니다..." />;
  }

  if (error || !stats) {
    return (
      <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm max-w-2xl mx-auto my-12">
        <h4 className="font-bold mb-2">오류 발생</h4>
        <p>{error}</p>
        <button
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold rounded-lg text-xs transition-colors"
        >
          재시도
        </button>
      </div>
    );
  }

  // Pre-process chart data
  const hasData = stats.total_plants > 0;
  
  // Fake chart data showing power recovery opportunities
  const mockChartData = [
    { name: '오염 세척', value: 12.4, color: '#f59e0b' },
    { name: '음영 확인', value: 8.5, color: '#f97316' },
    { name: '결선 수리', value: 15.8, color: '#ec4899' },
    { name: '소자 교체', value: 24.2, color: '#a855f7' },
    { name: '기타 보수', value: 5.1, color: '#6366f1' }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900 to-slate-900 border border-brand-500/10 p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black text-slate-100 mb-2 tracking-tight">태양광 유지관리 AI 관제 센터</h2>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              자율비행 드론이 촬영한 열화상·RGB 이미지 및 발전소 텔레메트리 데이터를 결합해 패널 오염과 파손, 핫스팟 등 실시간 발전 손실 리스크를 자동 분석합니다.
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleCreateDemo}
              disabled={isSeeding}
              className="px-5 py-3 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-slate-100 font-bold text-sm tracking-wide shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2 shrink-0"
            >
              <TrendingUp className="w-4 h-4" />
              {isSeeding ? '데모 시딩 및 분석 중...' : '원클릭 데모 데이터 생성'}
            </button>
            
            <button
              onClick={() => navigate('/plants/new')}
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/40 text-slate-200 font-bold text-sm tracking-wide transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              발전소 등록
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="모니터링 중인 발전소"
          value={stats.total_plants}
          icon={<Factory className="w-5 h-5" />}
          description="현재 등록된 총 태양광 발전소"
        />
        <StatCard
          title="누적 드론 정기 점검"
          value={stats.total_inspections}
          icon={<Eye className="w-5 h-5" />}
          description="촬영 이미지 및 센서 데이터 수집 횟수"
        />
        <StatCard
          title="인공지능 진단 완료"
          value={stats.analyzed_inspections}
          icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
          description="진단 알고리즘 분석 완료 점검 건수"
          trend={stats.total_inspections > 0 ? `${Math.round((stats.analyzed_inspections / stats.total_inspections) * 100)}%` : undefined}
        />
        <StatCard
          title="고위험 주의 구역"
          value={stats.high_risk_zones_count}
          icon={<AlertTriangle className="w-5 h-5 text-rose-500" />}
          description="유지보수 점수가 70점 이상인 구역 수"
          trend={stats.high_risk_zones_count > 0 ? '긴급 점검' : '안정'}
          trendIsPositive={stats.high_risk_zones_count === 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Recent scans */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              최근 드론 자율점검 현황
            </h3>
            <button
              onClick={() => navigate('/plants')}
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
            >
              전체 보기
            </button>
          </div>

          {!hasData ? (
            <EmptyState
              title="등록된 데이터가 없습니다"
              description="상단의 데모 데이터 생성 버튼을 클릭하거나, 신규 발전소 및 점검 데이터를 직접 등록해 분석을 실행해 보세요."
              actionButton={
                <button
                  onClick={handleCreateDemo}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-slate-100 font-bold text-xs transition-colors"
                >
                  데모 시드 데이터 생성
                </button>
              }
            />
          ) : (
            <div className="border border-slate-800/80 bg-slate-900/40 rounded-2xl overflow-hidden backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-400">
                  <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">발전소명</th>
                      <th className="px-6 py-4">점검 제목</th>
                      <th className="px-6 py-4">상태</th>
                      <th className="px-6 py-4">업로드 일시</th>
                      <th className="px-6 py-4 text-right">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {stats.recent_inspections.map((ins) => (
                      <tr key={ins.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-300">{ins.plant_name}</td>
                        <td className="px-6 py-4">{ins.title}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={ins.status} />
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">{formatDate(ins.created_at)}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => navigate(`/inspections/${ins.id}`)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                          >
                            상세 분석
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right: Diagnosis stats visual */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-400" />
            조치별 발전량 복구 잠재력
          </h3>
          <div className="border border-slate-800/80 bg-slate-900/40 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between h-[300px]">
            <span className="text-xs text-slate-500 block mb-2">유지보수 작업 유형별 일일 전력 생산 회복 기대치 (kWh)</span>
            <div className="w-full flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '11px' }}
                    itemStyle={{ color: '#38abf8', fontSize: '11px' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {mockChartData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
