export interface Size {
  readonly x: number,
  readonly y: number,
  readonly z: number,
};

export interface VoxelImage<Type> {
  readonly size: Size,
  get(x: number, y: number, z: number): Type,
  set(x: number, y: number, z: number, value: Type): void,
};