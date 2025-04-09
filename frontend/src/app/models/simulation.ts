export interface Simulation {
  id: number;
  name: string;
  created_at: string;
  output_dir: string;
  json_archive_filename: string;
  num_runs: number;
  run_len: number;
}

export interface SimulationCreate {
  name: string;
  num_runs: number;
  run_len: number;
}

export interface SimulationUpdate {
  name?: string;
  num_runs?: number;
  run_len?: number;
}

export interface MessageResponse {
  message: string;
}
