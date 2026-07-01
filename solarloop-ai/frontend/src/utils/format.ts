export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch {
    return dateStr;
  }
};

export const formatCapacity = (kw: number): string => {
  if (kw === undefined || kw === null) return '-';
  return `${kw.toLocaleString()} kW`;
};

export const formatPower = (kwh: number): string => {
  if (kwh === undefined || kwh === null) return '-';
  return `${kwh.toFixed(1)} kWh`;
};

export const formatScore = (score: number): string => {
  if (score === undefined || score === null) return '-';
  return `${Math.round(score)}점`;
};

export const getPlantTypeLabel = (type: string): string => {
  switch (type) {
    case 'rooftop': return '옥상 태양광';
    case 'ground': return '지상형 태양광';
    case 'factory_roof': return '공장 지붕 태양광';
    case 'public_building': return '공공건물 태양광';
    default: return type || '-';
  }
};
