import React from 'react';
import { HelpCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionButton?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, actionButton }) => {
  return (
    <div className="flex flex-col items-center justify-center border border-slate-800/80 bg-slate-900/40 rounded-2xl p-12 text-center backdrop-blur-md">
      <div className="w-16 h-16 rounded-full bg-slate-800/60 flex items-center justify-center border border-slate-700/50 mb-4 shadow-inner">
        <HelpCircle className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-2">{title}</h3>
      <p className="text-slate-400 text-sm max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionButton}
    </div>
  );
};

export default EmptyState;
