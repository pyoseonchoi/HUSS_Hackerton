export interface Plant {
  id: number;
  name: string;
  location_name: string;
  latitude: number;
  longitude: number;
  plant_type: 'rooftop' | 'ground' | 'factory_roof' | 'public_building';
  capacity_kw: number;
  owner_name?: string;
  created_at: string;
  latest_inspection_id?: number;
  anomaly_count?: number;
  total_zones?: number;
  latest_action?: string;
  current_output_kw?: number;
  efficiency_pct?: number;
  status?: 'critical' | 'warning' | 'normal';
}
