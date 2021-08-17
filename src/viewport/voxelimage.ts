export default interface VoxelImage<Type> {
  get(x: number, y: number, z: number): Type,
};