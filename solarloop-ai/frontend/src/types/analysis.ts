export interface PanelZone {
  id: number;
  inspection_id: number;
  zone_code: string;
  row_index: number;
  col_index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  soiling_score: number;
  shading_score: number;
  thermal_score: number;
  damage_score: number;
  generation_loss_score: number;
  priority_score: number;
  status_label: 'NORMAL' | 'SOILING' | 'SHADING' | 'THERMAL_ANOMALY' | 'PHYSICAL_DAMAGE_SUSPECTED' | 'GENERATION_LOSS_SUSPECTED';
  recommendation_label: 'NORMAL_MONITORING' | 'CLEANING_PRIORITY' | 'INSPECTION_REQUIRED' | 'WAIT_FOR_RAIN' | 'REPAIR_REVIEW';
  explanation?: string;
}

export interface MaintenanceAction {
  id: number;
  inspection_id: number;
  zone_code: string;
  action_type: 'NORMAL_MONITORING' | 'CLEANING_PRIORITY' | 'INSPECTION_REQUIRED' | 'WAIT_FOR_RAIN' | 'REPAIR_REVIEW';
  priority_rank: number;
  expected_recovery_kwh?: number;
  reason: string;
  created_at: string;
}

export interface AnalysisSummary {
  total_zones: number;
  normal_count: number;
  cleaning_priority_count: number;
  inspection_required_count: number;
  wait_for_rain_count: number;
  repair_review_count: number;
  average_priority_score: number;
}
