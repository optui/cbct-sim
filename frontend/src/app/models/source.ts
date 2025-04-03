export enum ParticleType {
    GAMMA = "gamma"
}

// You can reuse the Rotation class if needed.
export class Rotation {
    axis: "x" | "y" | "z";
    angle: number;

    constructor(axis: "x" | "y" | "z" = "x", angle: number = 0.0) {
        this.axis = axis;
        this.angle = angle;
    }
}

// Position interface (currently only a box type is defined)
export interface BoxPosition {
    type: "box";
    translation: number[]; // e.g. [0, 0, 0]
    rotation: Rotation;
    size: number[];
    unit: "nm" | "mm" | "cm" | "m";
}

export type PositionConfig = BoxPosition;

// Direction interface (currently only focused direction is defined)
export interface FocusedDirection {
    type: "focused";
    focus_point: number[];
}

export type DirectionConfig = FocusedDirection;

// Energy interface (currently only mono energy is defined)
export interface MonoEnergy {
    type: "mono";
    mono: number;
    unit: "keV" | "MeV" | "eV";
}

export type EnergyConfig = MonoEnergy;

export class Source {
    id?: number; // optional – assigned by the backend
    name: string;
    attached_to: string;
    particle: ParticleType;
    position: PositionConfig;
    direction: DirectionConfig;
    energy: EnergyConfig;
    n?: number;
    activity?: number;
    activity_unit: "Bq" | "kBq" | "MBq";

    constructor(
        name: string,
        position: PositionConfig,
        direction: DirectionConfig,
        energy: EnergyConfig,
        attached_to: string = "world",
        particle: ParticleType = ParticleType.GAMMA,
        activity_unit: "Bq" | "kBq" | "MBq" = "Bq",
        n?: number,
        activity?: number
    ) {
        this.name = name;
        this.attached_to = attached_to;
        this.particle = particle;
        this.position = position;
        this.direction = direction;
        this.energy = energy;
        this.activity_unit = activity_unit;
        this.n = n;
        this.activity = activity;
    }
}
