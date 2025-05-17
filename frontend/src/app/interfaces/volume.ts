import { Unit, Vector3, Rotation } from './primitives';

export enum VolumeType {
  BOX = 'Box',
  SPHERE = 'Sphere'
}

export interface BaseShape {
  unit: Unit;
}

export interface BoxShape extends BaseShape {
  type: VolumeType.BOX;
  size: Vector3;
}

export interface SphereShape extends BaseShape {
  type: VolumeType.SPHERE;
  rmin: number;
  rmax: number;
}

export type VolumeShape = BoxShape | SphereShape;

export interface DynamicParams {
  enabled: boolean;
  translation_end?: Vector3;
  angle_end?: number;
}

export interface VolumeBase {
  name: string;
  mother?: string;
  material: string;
  translation: Vector3;
  translation_unit: Unit;
  rotation: Rotation;
  shape: VolumeShape;
  dynamic_params: DynamicParams;
}

export interface VolumeCreate extends VolumeBase {}

export interface VolumeUpdate {
  name?: string;
  mother?: string;
  material?: string;
  translation?: Vector3;
  translation_unit?: Unit;
  rotation?: Rotation;
  shape?: VolumeShape;
  dynamic_params?: DynamicParams;
}

export interface VolumeRead extends VolumeBase {
  id: number;
  simulation_id: number;
}
