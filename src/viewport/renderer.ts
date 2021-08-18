import {VoxelImage, ImageCoordinates, ColorVoxel} from './voxelimage';

export default interface Renderer {
  render(params: RenderParameters): void,
  hitTest(params: HitTestParameters): Face | null,
}

export interface Lighting {
  readonly [Facing.LEFT]: number,
  readonly [Facing.RIGHT]: number,
  readonly [Facing.TOP]: number,
}

export interface ScreenCoordinates {
  u: number,
  v: number,
}

export interface StrokeSettings {
  width: number,
  color: string,
}

export interface DrawSettings {
  fill?: string,
  stroke?: StrokeSettings,
}

export enum Facing {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  TOP = 'TOP'
}

export interface Face {
  coords: ImageCoordinates,
  facing: Facing,
}

export interface FaceOverride {
  face: Face,
  color: string,
}

export interface ScreenParameters {
  boxDiagonalWidth: number,
  origin: ScreenCoordinates,
}

export interface HitTestParameters {
  ctx: CanvasRenderingContext2D,
  image: VoxelImage<ColorVoxel>
  viewport: ScreenParameters,
  coords: ScreenCoordinates,
}

export interface RenderParameters {
  ctx: CanvasRenderingContext2D, 
  image: VoxelImage<ColorVoxel>,
  lighting: Lighting,
  viewport: ScreenParameters,
  stroke?: StrokeSettings,
  intercept?: DrawSettings,
  overrides?: FaceOverride[], 
}
