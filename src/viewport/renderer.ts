import VoxelImage from './voxelimage';

export default interface Renderer {
  // TODO: need context for zoom, translate, etc...
  render(voxelImage: VoxelImage<boolean>, context: CanvasRenderingContext2D): void,
  // TODO: hit-test
}