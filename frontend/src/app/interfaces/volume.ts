export type Unit = 'nm' | 'mm' | 'cm' | 'm';
export type Vector3 = [number, number, number];

export interface Rotation {
  axis: 'x' | 'y' | 'z';
  angle: number;
}

export type VolumeType = 'Box' | 'Sphere';

export interface BaseShape {
  unit: Unit;
}

export interface BoxShape extends BaseShape {
  type: 'Box';
  size: Vector3;
}

export interface SphereShape extends BaseShape {
  type: 'Sphere';
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

export interface VolumeCreate extends VolumeBase { }

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