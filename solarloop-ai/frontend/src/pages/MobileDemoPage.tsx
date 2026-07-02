import React, { useState, useEffect } from 'react';
import { Smartphone, RotateCw, Monitor, HelpCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const MobileDemoPage: React.FC = () => {
  const [deviceColor, setDeviceColor] = useState<'titanium' | 'gold' | 'black'>('titanium');
  const [currentTime, setCurrentTime] = useState('20:26');

  // Update mock phone clock in real time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Frame colors
  const colorClasses = {
    titanium: 'border-[#8e8d8a] bg-[#8e8d8a] shadow-[#555452]/40',
    gold: 'border-[#dfccb7] bg-[#dfccb7] shadow-[#a89078]/40',
    black: 'border-[#232b2b] bg-[#232b2b] shadow-[#000000]/60',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 md:p-8 font-sans relative overflow-hidden">
      {/* Dynamic ambient backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header Control bar */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4 mb-6 relative z-30">
        <div className="flex items-center gap-3">
          <Link 
            to="/" 
            className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition-all text-slate-300"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-[10px] font-bold text-blue-400">
              <Smartphone className="w-3 h-3" />
              드론 관제 데모 시뮬레이터
            </span>
            <h1 className="text-xl font-black tracking-tight text-white mt-0.5">
              실시간 모바일 앱 뷰어
            </h1>
          </div>
        </div>

        {/* Options control */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-900/90 border border-slate-800/80 p-2 rounded-2xl backdrop-blur-md">
          <div className="flex items-center gap-1.5 px-2.5 border-r border-slate-800">
            <span className="text-[10px] font-bold text-slate-400">디바이스 색상:</span>
            <div className="flex gap-1.5 ml-1">
              <button 
                onClick={() => setDeviceColor('titanium')}
                className={`w-4.5 h-4.5 rounded-full bg-[#8e8d8a] border-2 cursor-pointer transition-transform ${deviceColor === 'titanium' ? 'border-blue-500 scale-110' : 'border-transparent'}`}
                title="내추럴 티타늄"
              />
              <button 
                onClick={() => setDeviceColor('gold')}
                className={`w-4.5 h-4.5 rounded-full bg-[#dfccb7] border-2 cursor-pointer transition-transform ${deviceColor === 'gold' ? 'border-blue-500 scale-110' : 'border-transparent'}`}
                title="골드"
              />
              <button 
                onClick={() => setDeviceColor('black')}
                className={`w-4.5 h-4.5 rounded-full bg-[#232b2b] border-2 cursor-pointer transition-transform ${deviceColor === 'black' ? 'border-blue-500 scale-110' : 'border-transparent'}`}
                title="스페이스 블랙"
              />
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 px-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>데스크톱 브라우저 내에서 가상 폰 터치 시뮬레이션을 수행합니다.</span>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-25">
        
        {/* Left Side: Mockup Explanations */}
        <div className="lg:col-span-5 space-y-6 text-slate-300">
          <div className="bg-slate-900/60 border border-slate-800/60 p-5 rounded-2xl backdrop-blur-md">
            <h3 className="text-sm font-black text-white mb-2 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-400" />
              iPhone 15 Pro 에뮬레이션
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              공유기 설정 차단 등으로 인해 실제 스마트폰 접속이 원활하지 않을 때를 대비한 **데모용 가상 시뮬레이션 환경**입니다. 
              우측 아이폰 화면 액정을 클릭 및 드래그하면 모바일 해상도(375x812)에 맞게 최적화된 모바일 반응형 페이지를 손쉽게 조작해 볼 수 있습니다.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/60 p-5 rounded-2xl backdrop-blur-md space-y-3.5">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">주요 모바일 피처</h4>
            
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20 text-blue-400 font-bold text-xs">
                1
              </div>
              <div>
                <strong className="block text-xs text-slate-200">자동 모바일 반응형 최적화</strong>
                <p className="text-[10px] text-slate-400 mt-0.5">전국 지도, 발전소 카드 및 진단 보고서 레이아웃이 폰 화면 비율에 맞추어 상하 슬라이드 형태로 편리하게 재정렬됩니다.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20 text-emerald-400 font-bold text-xs">
                2
              </div>
              <div>
                <strong className="block text-xs text-slate-200">터치 제스처 조작 연동</strong>
                <p className="text-[10px] text-slate-400 mt-0.5">지도 영역을 손가락 제스처(컴퓨터에서는 마우스 드래그)로 편리하게 패닝 및 줌인/아웃하여 현장에서 실시간 검토가 가능합니다.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20 text-amber-400 font-bold text-xs">
                3
              </div>
              <div>
                <strong className="block text-xs text-slate-200">원클릭 리포팅 링크</strong>
                <p className="text-[10px] text-slate-400 mt-0.5">드론 촬영 후 자동 진단된 상세 보고서 페이지가 모바일 뷰에서도 정밀 그리드로 축소 표현되어 현장 정비팀이 즉각 오류 셀을 파악하기에 용이합니다.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Virtual iPhone Device Frame */}
        <div className="lg:col-span-7 flex justify-center">
          {/* Outer Phone Frame */}
          <div className={`relative w-[305px] h-[610px] rounded-[48px] border-[9px] p-2.5 shadow-2xl transition-all duration-300 ${colorClasses[deviceColor]}`}>
            
            {/* Screen Glass Surface */}
            <div className="w-full h-full bg-slate-900 rounded-[39px] overflow-hidden relative border border-slate-950 flex flex-col shadow-inner">
              
              {/* iOS Status Bar */}
              <div className="absolute top-0 left-0 w-full h-[28px] z-50 flex items-center justify-between px-6 text-white text-[9px] font-bold select-none bg-slate-950/20 backdrop-blur-xs">
                <span>{currentTime}</span>
                {/* Dynamic Island Pill shape */}
                <div className="absolute left-1/2 -translate-x-1/2 top-1.5 w-18 h-4 rounded-full bg-black flex items-center justify-end px-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-800"></div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[8px]">📶</span>
                  <span className="text-[8px]">LTE</span>
                  <span className="text-[8px]">🔋 80%</span>
                </div>
              </div>

              {/* iOS Bottom Indicator Bar */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 rounded-full bg-white/70 z-50 pointer-events-none" />

              {/* Iframe displaying the actual application */}
              <div className="w-full h-full pt-[28px] pb-[8px]">
                <iframe
                  src="/"
                  title="SolarLoop Mobile Live Frame"
                  className="w-full h-full border-0 bg-slate-50"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                />
              </div>
            </div>

            {/* Hardware Side Buttons */}
            {/* Ring/Silent Switch */}
            <div className="absolute left-[-11px] top-[75px] w-[2px] h-[15px] bg-[#666] rounded-l-sm" />
            {/* Volume Up */}
            <div className="absolute left-[-11px] top-[110px] w-[2px] h-[35px] bg-[#666] rounded-l-sm" />
            {/* Volume Down */}
            <div className="absolute left-[-11px] top-[155px] w-[2px] h-[35px] bg-[#666] rounded-l-sm" />
            {/* Power/Side Button */}
            <div className="absolute right-[-11px] top-[135px] w-[2px] h-[55px] bg-[#666] rounded-r-sm" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default MobileDemoPage;
