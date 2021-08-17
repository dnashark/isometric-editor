export interface VoxelImageSize {
  readonly x: number,
  readonly y: number,
  readonly z: number,
};

export interface VoxelImage<Type> {
  readonly size: VoxelImageSize,
  get(x: number, y: number, z: number): Type,
  set(x: number, y: number, z: number, value: Type): void,
};