import {VoxelImage, ImageCoordinates} from './voxelimage';

export default interface Renderer {
  render(params: RenderParameters): void,
  hitTest(params: HitTestParameters): Face | null,
}

export type Color = string;

export interface ScreenCoordinates {
  u: number,
  v: number,
}

export interface StrokeSettings {
  width: number,
  color: Color,
}

export interface DrawSettings {
  fill?: Color,
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
  color: Color,
}

export interface ScreenParameters {
  boxDiagonalWidth: number,
  origin: ScreenCoordinates,
}

export interface HitTestParameters {
  ctx: CanvasRenderingContext2D,
  image: VoxelImage<boolean>
  viewport: ScreenParameters,
  coords: ScreenCoordinates,
}

export interface RenderParameters {
  ctx: CanvasRenderingContext2D, 
  image: VoxelImage<boolean>,
  viewport: ScreenParameters,
  stroke?: StrokeSettings,
  intercept?: DrawSettings,
  overrides?: FaceOverride[], 
}
