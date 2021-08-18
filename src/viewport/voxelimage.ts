import { RGB } from "./color";

export interface VoxelImageSize {
  readonly x: number,
  readonly y: number,
  readonly z: number,
};

export interface ImageCoordinates {
  x: number,
  y: number,
  z: number,
}

export enum ImageDimension {
  X = 'x',
  Y = 'y',
  Z = 'z',
}

export type ColorVoxel = Readonly<RGB> | null;

export interface VoxelImage<Type> {
  readonly size: VoxelImageSize,
  get(coords: ImageCoordinates): Type,
  set(coords: ImageCoordinates, value: Type): void,
};