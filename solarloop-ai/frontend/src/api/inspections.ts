import client from './client';
import type { Inspection, InspectionDetail } from '../types/inspection';


export interface DashboardSummary {
  total_plants: number;
  total_inspections: number;
  analyzed_inspections: number;
  high_risk_zones_count: number;
  total_zones_count: number;
  total_anomaly_zones: number;
  recent_inspections: {
    id: number;
    plant_id: number;
    plant_name: string;
    title: string;
    status: string;
    rows: number;
    cols: number;
    created_at: string;
  }[];
  recent_plants: {
    id: number;
    name: string;
    location: string;
    location_name: string;
    capacity_kw: number;
    plant_type: string;
    owner_name: string;
    created_at: string;
  }[];
  capacity_by_type: {
    plant_type: string;
    total_capacity: number;
  }[];
}

export const getInspections = async (plantId?: number): Promise<Inspection[]> => {
  const params = plantId ? { plant_id: plantId } : {};
  const response = await client.get<Inspection[]>('/api/inspections', { params });
  return response.data;
};

export const getInspectionDetail = async (id: number): Promise<InspectionDetail> => {
  const response = await client.get<InspectionDetail>(`/api/inspections/${id}`);
  return response.data;
};

export const createInspection = async (formData: FormData): Promise<Inspection> => {
  const response = await client.post<Inspection>('/api/inspections', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const analyzeInspection = async (id: number): Promise<any> => {
  const response = await client.post(`/api/inspections/${id}/analyze`);
  return response.data;
};

export const seedDemoData = async (): Promise<{ status: string; message: string; inspection_id: number }> => {
  const response = await client.post('/api/demo/seed');
  return response.data;
};

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const response = await client.get<DashboardSummary>('/api/dashboard');
  return response.data;
};
