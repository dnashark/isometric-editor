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

export interface ReadonlyVoxelImage {
  readonly size: VoxelImageSize,
  get(coords: ImageCoordinates): ColorVoxel,
};

export interface VoxelImage extends ReadonlyVoxelImage {
  set(coords: ImageCoordinates, value: ColorVoxel): void,
};

export function areImageCoordsEqual(c1: ImageCoordinates, c2: ImageCoordinates): boolean {
  return (
    c1.x == c2.x &&
    c1.y == c2.y &&
    c1.z == c2.z
  );
}

export function isInImage(coords: ImageCoordinates, size: VoxelImageSize): boolean {
  return (
    coords.x >= 0 && coords.x < size.x &&
    coords.y >= 0 && coords.x < size.y &&
    coords.z >= 0 && coords.x < size.z
  );
}