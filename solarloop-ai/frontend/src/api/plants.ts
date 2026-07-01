import client from './client';
import type { Plant } from '../types/plant';


export const getPlants = async (): Promise<Plant[]> => {
  const response = await client.get<Plant[]>('/api/plants');
  return response.data;
};

export const getPlant = async (id: number): Promise<Plant> => {
  const response = await client.get<Plant>(`/api/plants/${id}`);
  return response.data;
};

export const createPlant = async (plantData: Omit<Plant, 'id' | 'created_at'>): Promise<Plant> => {
  const response = await client.post<Plant>('/api/plants', plantData);
  return response.data;
};
