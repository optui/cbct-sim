import { Unit, Vector3 } from './primitives';

export interface ActorBase {
  attached_to: string;
  spacing: [number, number];
  size: [number, number];
  origin_as_image_center: boolean;
}

export interface ActorUpdate {
  attached_to?: string;
  spacing?: [number, number];
  size?: [number, number];
  origin_as_image_center?: boolean;
}

export interface SimulationBase {
  name: string;
  num_runs: number;
  run_len: number;
  actor: ActorBase;
}

export interface SimulationCreate extends SimulationBase {}

export interface SimulationUpdate {
  name?: string;
  num_runs?: number;
  run_len?: number;
  actor?: ActorUpdate;
}

export interface SimulationRead extends SimulationBase {
  id: number;
  created_at: string; // ISO format timestamp
  output_dir: string;
  json_archive_filename: string;
}

export interface ReconstructionParams {
  sod: number;
  sdd: number;
}
