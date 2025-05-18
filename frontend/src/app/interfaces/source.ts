import { Unit, Vector3 } from './primitives';

export interface BoxPosition {
  type: 'box';
  translation: Vector3;
  size: Vector3;
  unit: Unit;
}

export interface MonoEnergy {
  energy: number;
  unit: Unit;
}

export interface SourceBase {
  name: string;
  attached_to: string;
  particle: string;
  position: BoxPosition;
  focus_point: Vector3;
  energy: MonoEnergy;
  activity: number;
  unit: Unit;
}

export interface SourceCreate extends SourceBase {}

export interface SourceUpdate {
  name?: string;
  attached_to?: string;
  particle?: string;
  position?: BoxPosition;
  focus_point?: Vector3;
  energy?: MonoEnergy;
  activity?: number;
  activity_unit?: Unit;
}

export interface SourceRead extends SourceBase {
  id: number;
  simulation_id: number;
}
