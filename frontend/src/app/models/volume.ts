export enum VolumeType {
    BOX = "Box",
    SPHERE = "Sphere"
}

export class Rotation {
    axis: "x" | "y" | "z";
    angle: number;

    constructor(axis: "x" | "y" | "z" = "x", angle: number = 0.0) {
        this.axis = axis;
        this.angle = angle;
    }
}

export class BoxShape {
    type: VolumeType = VolumeType.BOX;
    size: number[];
    unit: "mm" | "cm" | "m";

    constructor(size: number[], unit: "mm" | "cm" | "m" = "cm") {
        this.size = size;
        this.unit = unit;
    }
}

export class SphereShape {
    type: VolumeType = VolumeType.SPHERE;
    rmin: number;
    rmax: number;
    unit: "mm" | "cm" | "m";

    constructor(rmin: number, rmax: number, unit: "mm" | "cm" | "m" = "cm") {
        this.rmin = rmin;
        this.rmax = rmax;
        this.unit = unit;
    }
}

export type VolumeShape = BoxShape | SphereShape;

export class Volume {
    name: string;
    mother: string;
    material: string;
    translation: number[];
    rotation: Rotation;
    color: number[];
    shape: VolumeShape;

    constructor(
        name: string,
        mother: string = "world",
        material: string = "G4_AIR",
        translation: number[] = [0.0, 0.0, 0.0],
        rotation: Rotation = new Rotation(),
        color: number[] = [0.25, 0.25, 0.25, 1.0],
        shape: VolumeShape
    ) {
        this.name = name;
        this.mother = mother;
        this.material = material;
        this.translation = translation;
        this.rotation = rotation;
        this.color = color;
        this.shape = shape;
    }
}
