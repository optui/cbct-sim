export type Vector3 = [number, number, number];

export enum Axis {
  X = 'x',
  Y = 'y',
  Z = 'z'
}

export interface Rotation {
  axis: Axis;
  angle: number;
}

export enum Unit {
  NM = 'nm',
  MM = 'mm',
  CM = 'cm',
  M = 'm',
  KEV = 'keV',
  EV = 'eV',
  MEV = 'MeV',
  BQ = 'Bq',
  SEC = 'sec'
}
