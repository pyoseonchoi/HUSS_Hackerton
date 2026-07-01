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
}
