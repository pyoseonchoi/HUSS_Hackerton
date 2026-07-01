import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-6">
      <div className="w-20 h-20 rounded-full bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-500 mb-6 animate-bounce">
        <Compass className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-black text-slate-200 mb-2">페이지를 찾을 수 없습니다</h2>
      <p className="text-sm text-slate-500 max-w-sm mb-8 leading-relaxed">
        이동하시려는 경로가 존재하지 않거나, 잘못된 URL 링크가 입력되었습니다. 주소를 다시 한 번 점검해 주십시오.
      </p>
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-slate-100 font-bold text-sm tracking-wide transition-colors"
      >
        <Home className="w-4 h-4" />
        대시보드로 돌아가기
      </button>
    </div>
  );
};

export default NotFoundPage;
