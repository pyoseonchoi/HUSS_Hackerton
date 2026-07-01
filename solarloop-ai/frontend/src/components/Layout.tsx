import React from 'react';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Global Header / Navigation Bar */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200/80 py-6 text-center text-xs text-slate-400 font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 SolarLoop AI Inc. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-600 transition-colors">이용약관</a>
            <a href="#" className="hover:text-slate-600 transition-colors">개인정보처리방침</a>
            <a href="#" className="hover:text-slate-600 transition-colors">관제 센터 문의</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
