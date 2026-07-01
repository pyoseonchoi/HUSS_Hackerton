import React from 'react';

const LoadingSpinner: React.FC<{ message?: string }> = ({ message = '데이터를 불러오는 중입니다...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] w-full py-12">
      <div className="relative w-16 h-16">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-full border-4 border-brand-500/20 animate-pulse"></div>
        {/* Spinning indicator */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-400 border-r-brand-400 animate-spin"></div>
        {/* Sun-like core icon */}
        <div className="absolute inset-4 rounded-full bg-brand-500/10 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-amber-400 animate-ping"></div>
        </div>
      </div>
      <p className="mt-4 text-slate-400 text-sm font-medium tracking-wide animate-pulse">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
