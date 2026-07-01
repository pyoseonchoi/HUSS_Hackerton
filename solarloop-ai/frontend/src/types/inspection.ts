import type { Plant } from './plant';
import type { PanelZone, MaintenanceAction, AnalysisSummary } from './analysis';


export interface Inspection {
  id: number;
  plant_id: number;
  title: string;
  rgb_image_path: string;
  thermal_image_path?: string;
  generation_csv_path?: string;
  weather_json_path?: string;
  rows: number;
  cols: number;
  status: 'uploaded' | 'analyzed' | 'failed';
  created_at: string;
  analyzed_at?: string;
}

export interface InspectionDetail {
  inspection: Inspection;
  plant: Plant;
  image_url: string;
  thermal_image_url?: string;
  zones: PanelZone[];
  actions: MaintenanceAction[];
  summary?: AnalysisSummary;
}
