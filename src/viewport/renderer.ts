import CoordinateFace from '../components/coordinateface';
import {VoxelImage} from './voxelimage';

export default interface Renderer {
  // TODO: need context for zoom, translate, etc...
  render(voxelImage: VoxelImage<boolean>, hitTestedFace: CoordinateFace | null, context: CanvasRenderingContext2D): void,
  hitTest(voxelImage: VoxelImage<boolean>, u: number, v: number, context: CanvasRenderingContext2D): CoordinateFace | null,
}