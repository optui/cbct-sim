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

export interface GenericSourceBase {
  name: string;
  attached_to: string;
  particle: string;
  position: BoxPosition;
  focus_point: Vector3;
  energy: MonoEnergy;
  activity: number;
  unit: Unit;
}

export interface GenericSourceCreate extends GenericSourceBase {}

export interface GenericSourceUpdate {
  name?: string;
  attached_to?: string;
  particle?: string;
  position?: BoxPosition;
  focus_point?: Vector3;
  energy?: MonoEnergy;
  activity?: number;
  activity_unit?: Unit;
}

export interface GenericSourceRead extends GenericSourceBase {
  id: number;
  simulation_id: number;
}
