export interface Simulation {
  id: number;
  name: string;
  created_at: string;
  output_dir: string;
  json_archive_filename: string;
}

export interface SimulationCreate {
  name: string;
}

export interface SimulationUpdate {
  name: string;
}

export interface MessageResponse {
  detail: string;
}
