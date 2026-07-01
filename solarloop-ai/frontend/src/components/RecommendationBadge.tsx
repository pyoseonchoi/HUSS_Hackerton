import React from 'react';
import { getStatusStyle } from '../utils/statusColor';

interface RecommendationBadgeProps {
  label: string;
}

const RecommendationBadge: React.FC<RecommendationBadgeProps> = ({ label }) => {
  const style = getStatusStyle(label);

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${style.badgeBg}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {style.text}
    </span>
  );
};

export default RecommendationBadge;
