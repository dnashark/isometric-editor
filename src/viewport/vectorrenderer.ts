import { HSVToRGB, RGB, RGBToHSV, RGBToString } from './color';
import Renderer, { Facing, Face, RenderParameters, HitTestParameters, ScreenParameters, ScreenCoordinates, StrokeSettings, DrawSettings, Lighting } from './renderer';
import { ImageDimension, ImageCoordinates, VoxelImageSize } from './voxelimage';

const DIMENSIONS_AND_FACINGS: Array<[ImageDimension, Facing]> = [
  [ImageDimension.X, Facing.RIGHT],
  [ImageDimension.Y, Facing.LEFT],
  [ImageDimension.Z, Facing.TOP]
];

export default class VectorRenderer implements Renderer {
  render(params: RenderParameters): void {
    if (params.intercept) {
      for (let dimensionAndFacing of DIMENSIONS_AND_FACINGS) {
        for (let coords of this.getPlane(dimensionAndFacing[0], -1, params.image.size)) {
          const overrides = this.getRenderOverrides(coords, params);
          const face = { coords, facing: dimensionAndFacing[1] }
          const drawSettings = this.overrideDrawSettings(params.intercept, face.facing, overrides);
          this.drawFace(face, drawSettings, params.viewport, params.ctx);
        }
      }
    }
    for (let coords of this.inDrawOrder(params.image.size)) {
      const voxel = params.image.get(coords);
      if (!voxel) continue;

      const overrides = this.getRenderOverrides(coords, params);
      for (let facing of Object.values(Facing)) {
        const face = { coords, facing, };
        this.drawFace(face, this.getDrawSettings(voxel, params.lighting, facing, params.stroke, overrides), params.viewport, params.ctx);
      }
    }
  }

  hitTest(params: HitTestParameters): Face | null {
    for (let coords of this.inReverseDrawOrder(params.image.size)) {
      if (!params.image.get(coords)) continue;
      for (let facing of Object.values(Facing)) {
        const face = { coords, facing, };
        const path = this.createFacePath(face, params.viewport, params.ctx);
        if (params.ctx.isPointInPath(path, params.coords.u, params.coords.v)) return face;
      }
    }
    for (let dimensionAndFacing of DIMENSIONS_AND_FACINGS) {
      for (let coords of this.getPlane(dimensionAndFacing[0], -1, params.image.size)) {
        const face = { coords, facing: dimensionAndFacing[1] }
        const path = this.createFacePath(face, params.viewport, params.ctx);
        if (params.ctx.isPointInPath(path, params.coords.u, params.coords.v)) return face;
      }
    }
    return null;
  }

  private * getPlane(fixedDimension: ImageDimension, value: number, size: VoxelImageSize): Generator<ImageCoordinates> {
    const variableDimensions = Object.values(ImageDimension).filter(d => d != fixedDimension);
    for (let i = 0; i < size[variableDimensions[0]]; i++) {
      for (let j = 0; j < size[variableDimensions[1]]; j++) {
        const coords = { x: 0, y: 0, z: 0 };
        coords[fixedDimension] = value;
        coords[variableDimensions[0]] = i;
        coords[variableDimensions[1]] = j;
        yield coords;
      }
    }
  }

  private lightColor(color: RGB, facing: Facing, lighting: Lighting): RGB {
    const hsv = RGBToHSV(color);
    hsv.v *= lighting[facing];
    return HSVToRGB(hsv);
  }

  private getDrawSettings(color: RGB, lighting: Lighting, facing: Facing, stroke: StrokeSettings | undefined, overrides: Map<Facing, string> | null): DrawSettings {
    const litColor = this.lightColor(color, facing, lighting);
    const settings: DrawSettings = {
      stroke: stroke,
      fill: RGBToString(litColor),
    };
    return this.overrideDrawSettings(settings, facing, overrides);
  }

  private getRenderOverrides(coord: ImageCoordinates, params: RenderParameters): Map<Facing, string> | null {
    if (!params.overrides) return null;

    let overrides: Map<Facing, string> | null = null;
    for (let override of params.overrides) {
      if (coord.x == override.face.coords.x &&
        coord.y == override.face.coords.y &&
        coord.z == override.face.coords.z) {
        if (!overrides) overrides = new Map();
        overrides.set(override.face.facing, override.color);
      }
    }
    return overrides;
  }

  private overrideDrawSettings(settings: DrawSettings, facing: Facing, overrides: Map<Facing, string> | null): DrawSettings {
    if (!overrides) return settings;
    const overrideFill = overrides.get(facing);
    if (!overrideFill) return settings;
    return { stroke: settings.stroke, fill: overrideFill };
  }

  private createFacePath(face: Face, viewport: ScreenParameters, ctx: CanvasRenderingContext2D): Path2D {
    const origin = this.convertToScreenCoords(face.coords, viewport);
    const path = new Path2D;
    path.moveTo(origin.u, origin.v);
    switch (face.facing) {
      case Facing.LEFT:
        path.lineTo(origin.u, origin.v + viewport.boxDiagonalWidth / 2);
        path.lineTo(origin.u - viewport.boxDiagonalWidth / 2, origin.v + viewport.boxDiagonalWidth / 4);
        path.lineTo(origin.u - viewport.boxDiagonalWidth / 2, origin.v - viewport.boxDiagonalWidth / 4);
        break;
      case Facing.RIGHT:
        path.lineTo(origin.u + viewport.boxDiagonalWidth / 2, origin.v - viewport.boxDiagonalWidth / 4);
        path.lineTo(origin.u + viewport.boxDiagonalWidth / 2, origin.v + viewport.boxDiagonalWidth / 4);
        path.lineTo(origin.u, origin.v + viewport.boxDiagonalWidth / 2);
        break;
      case Facing.TOP:
        path.lineTo(origin.u - viewport.boxDiagonalWidth / 2, origin.v - viewport.boxDiagonalWidth / 4);
        path.lineTo(origin.u, origin.v - viewport.boxDiagonalWidth / 2);
        path.lineTo(origin.u + viewport.boxDiagonalWidth / 2, origin.v - viewport.boxDiagonalWidth / 4);
        break;
    }
    path.closePath();
    return path;
  }

  private drawFace(face: Face, settings: DrawSettings, viewport: ScreenParameters, ctx: CanvasRenderingContext2D) {
    const path = this.createFacePath(face, viewport, ctx);
    if (settings.fill) {
      ctx.fillStyle = settings.fill;
      ctx.fill(path);
    }
    if (settings.stroke) {
      ctx.lineWidth = settings.stroke.width;
      ctx.strokeStyle = settings.stroke.color;
      ctx.stroke(path);
    }
  }

  private * inDrawOrder(imageSize: VoxelImageSize): Generator<ImageCoordinates> {
    for (let z = 0; z < imageSize.z; z++) {
      for (let y = 0; y < imageSize.y; y++) {
        for (let x = 0; x < imageSize.x; x++) {
          yield { x, y, z, };
        }
      }
    }
  }

  private * inReverseDrawOrder(imageSize: VoxelImageSize): Generator<ImageCoordinates> {
    for (let z = imageSize.z - 1; z >= 0; z--) {
      for (let y = imageSize.y - 1; y >= 0; y--) {
        for (let x = imageSize.x - 1; x >= 0; x--) {
          yield { x, y, z, };
        }
      }
    }
  }

  private convertToScreenCoords(coords: ImageCoordinates, viewport: ScreenParameters): ScreenCoordinates {
    return {
      u: viewport.origin.u + (coords.x - coords.y) * viewport.boxDiagonalWidth / 2,
      v: viewport.origin.v + (coords.x + coords.y - 2 * coords.z) * viewport.boxDiagonalWidth / 4,
    };
  }
}
