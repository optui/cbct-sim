export type ParticleType = 'gamma';

export interface Rotation {
    axis: 'x' | 'y' | 'z';
    angle: number;
}

export interface BoxPosition {
    type: 'box';
    translation: number[];
    rotation: Rotation;
    size: number[];
    unit: 'nm' | 'mm' | 'cm' | 'm';
}

export type PositionConfig = BoxPosition;

export interface FocusedDirection {
    type: 'focused';
    focus_point: number[];
}

export type DirectionConfig = FocusedDirection;

export interface MonoEnergy {
    type: 'mono';
    mono: number;
    unit: 'keV' | 'MeV' | 'eV';
}

export type EnergyConfig = MonoEnergy;

export interface GenericSourceBase {
    name: string;
    attached_to: string;
    particle: ParticleType;
    position: PositionConfig;
    direction: DirectionConfig;
    energy: EnergyConfig;
    n?: number;
    activity?: number;
    activity_unit?: 'Bq' | 'kBq' | 'MBq';
}

export interface GenericSourceCreate extends GenericSourceBase { }

export interface GenericSourceUpdate {
    name?: string;
    attached_to?: string;
    particle?: ParticleType;
    position?: PositionConfig;
    direction?: DirectionConfig;
    energy?: EnergyConfig;
    n?: number;
    activity?: number;
    activity_unit?: 'Bq' | 'kBq' | 'MBq';
}

export interface GenericSourceRead extends GenericSourceBase {
    id: number;
}