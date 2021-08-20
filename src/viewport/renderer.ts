import { VoxelImage, ImageCoordinates, ColorVoxel, ReadonlyVoxelImage, areImageCoordsEqual } from '../state/voxelimage';

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
  image: ReadonlyVoxelImage,
  viewport: ScreenParameters,
  coords: ScreenCoordinates,
}

export interface RenderParameters {
  ctx: CanvasRenderingContext2D,
  image: ReadonlyVoxelImage,
  lighting: Lighting,
  viewport: ScreenParameters,
  stroke?: StrokeSettings,
  intercept?: DrawSettings,
  overrides?: FaceOverride[],
}

export function getCoordsOpposingFace(face: Face): ImageCoordinates {
  if (face.facing == Facing.LEFT) {
    return { x: face.coords.x, y: face.coords.y + 1, z: face.coords.z };
  } else if (face.facing == Facing.RIGHT) {
    return { x: face.coords.x + 1, y: face.coords.y, z: face.coords.z };
  } else {
    return { x: face.coords.x, y: face.coords.y, z: face.coords.z + 1 };
  }
}

export function areFacesEqual(f1: Face, f2: Face):boolean {
  return areImageCoordsEqual(f1.coords, f2.coords) && f1.facing == f2.facing;
}