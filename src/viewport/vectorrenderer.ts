import Renderer, { Color, Facing, Face, ImageCoordinates, RenderParameters, HitTestParameters, ScreenParameters, ScreenCoordinates, StrokeSettings, DrawSettings } from './renderer';
import { VoxelImage, VoxelImageSize } from './voxelimage';

type ScreenCoord = { u: number, v: number };

const WIDTH = 25;
const STROKE = true;
const STROKE_WIDTH = .5;
const STROKE_COLOR = '#000';
const ORIGIN = { u: 250, v: 250 };
const SHOW_BACK = true;

export default class VectorRenderer implements Renderer {
  render(params: RenderParameters): void {
    if (params.intercept) {
      this.drawIntercepts(params);
    }
    for (let coords of this.inDrawOrder(params.image.size)) {
      if (!params.image.get(coords.x, coords.y, coords.z)) continue;

      const overrides = this.getRenderOverrides(coords, params);
      for (let facing of Object.values(Facing)) {
        const face = { coords, facing, };
        this.drawFace(face, this.getDrawSettings(face, params.stroke, overrides), params.viewport, params.ctx);
      }
    }
  }

  hitTest(params: HitTestParameters): Face | null {
    for (let z = params.image.size.z - 1; z >= 0; z--) {
      for (let y = params.image.size.y - 1; y >= 0; y--) {
        for (let x = params.image.size.x - 1; x >= 0; x--) {
          if (params.image.get(x, y, z)) {
            const leftFace = this.createLeftFacePath(x, y, z, WIDTH, ORIGIN);
            if (params.ctx.isPointInPath(leftFace, params.coords.u, params.coords.v)) return { coords: { x, y, z, }, facing: Facing.LEFT };
            const rightFace = this.createRightFacePath(x, y, z, WIDTH, ORIGIN);
            if (params.ctx.isPointInPath(rightFace, params.coords.u, params.coords.v)) return { coords: { x, y, z, }, facing: Facing.RIGHT };
            const topFace = this.createTopFacePath(x, y, z, WIDTH, ORIGIN);
            if (params.ctx.isPointInPath(topFace, params.coords.u, params.coords.v)) return { coords: { x, y, z, }, facing: Facing.TOP };
          }
        }
      }
    }
    for (let x = 0; x < params.image.size.x; x++) {
      for (let y = 0; y < params.image.size.y; y++) {
        const topFace = this.createTopFacePath(x, y, -1, WIDTH, ORIGIN);
        if (params.ctx.isPointInPath(topFace, params.coords.u, params.coords.v)) return { coords: { x, y, z: -1 }, facing: Facing.TOP };
      }
    }
    for (let x = 0; x < params.image.size.x; x++) {
      for (let z = 0; z < params.image.size.z; z++) {
        const leftFace = this.createLeftFacePath(x, -1, z, WIDTH, ORIGIN);
        if (params.ctx.isPointInPath(leftFace, params.coords.u, params.coords.v)) return { coords: { x, y: -1, z, }, facing: Facing.LEFT };
      }
    }
    for (let y = 0; y < params.image.size.y; y++) {
      for (let z = 0; z < params.image.size.z; z++) {
        const rightFace = this.createRightFacePath(-1, y, z, WIDTH, ORIGIN);
        if (params.ctx.isPointInPath(rightFace, params.coords.u, params.coords.v)) return { coords: { x: -1, y, z, }, facing: Facing.RIGHT };
      }
    }
    return null;
  }

  private drawIntercepts(params: RenderParameters): void {
    if (!params.intercept) return;

    for (let x = 0; x < params.image.size.x; x++) {
      for (let y = 0; y < params.image.size.y; y++) {
        const coords: ImageCoordinates = { x, y, z: -1 };
        const overrides = this.getRenderOverrides(coords, params);
        const face = { coords, facing: Facing.TOP }
        const drawSettings = this.overrideDrawSettings(params.intercept, face.facing, overrides);
        this.drawFace(face, drawSettings, params.viewport, params.ctx);
      }
    }
    for (let x = 0; x < params.image.size.x; x++) {
      for (let z = 0; z < params.image.size.z; z++) {
        const coords: ImageCoordinates = { x, y: -1, z, };
        const overrides = this.getRenderOverrides(coords, params);
        const face = { coords, facing: Facing.LEFT }
        const drawSettings = this.overrideDrawSettings(params.intercept, face.facing, overrides);
        this.drawFace(face, drawSettings, params.viewport, params.ctx);
      }
    }
    for (let y = 0; y < params.image.size.y; y++) {
      for (let z = 0; z < params.image.size.z; z++) {
        const coords: ImageCoordinates = { x: -1, y, z, };
        const overrides = this.getRenderOverrides(coords, params);
        const face = { coords, facing: Facing.RIGHT }
        const drawSettings = this.overrideDrawSettings(params.intercept, face.facing, overrides);
        this.drawFace(face, drawSettings, params.viewport, params.ctx);
      }
    }
  }

  private getDrawSettings(face: Face, stroke: StrokeSettings | undefined, overrides: Map<Facing, Color> | null): DrawSettings {
    const settings: DrawSettings = {
      stroke: stroke,
      fill: this.getFacingFill(face.facing),
    };
    return this.overrideDrawSettings(settings, face.facing, overrides);
  }

  private getFacingFill(facing: Facing): Color {
    if (facing == Facing.RIGHT) return '#eee';
    if (facing == Facing.TOP) return '#ccc';
    return '#aaa';
  }

  private getRenderOverrides(coord: ImageCoordinates, params: RenderParameters): Map<Facing, Color> | null {
    if (!params.overrides) return null;

    let overrides: Map<Facing, Color> | null = null;
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

  private overrideDrawSettings(settings: DrawSettings, facing: Facing, overrides: Map<Facing, Color> | null): DrawSettings {
    if (!overrides) return settings;
    const overrideFill = overrides.get(facing);
    if (!overrideFill) return settings;
    return { stroke: settings.stroke, fill: overrideFill };
  }

  private convertToScreen(x: number, y: number, z: number, width: number): ScreenCoord {
    return {
      u: (x - y) * width / 2,
      v: (x + y - 2 * z) * width / 4,
    };
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

  private *inDrawOrder(imageSize: VoxelImageSize): Generator<ImageCoordinates> {
    for (let z = 0; z < imageSize.z; z++) {
      for (let y = 0; y < imageSize.y; y++) {
        for (let x = 0; x < imageSize.x; x++) {
          yield { x, y, z, };
        }
      }
    }
  }

  private *inReverseDrawOrder(imageSize: VoxelImageSize): Generator<ImageCoordinates> {
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

  private createTopFacePath(x: number, y: number, z: number, width: number, origin: ScreenCoord): Path2D {
    const base = this.convertToScreen(x, y, z, width);
    base.u += origin.u;
    base.v += origin.v;
    const path = new Path2D();
    path.moveTo(base.u, base.v);
    path.lineTo(base.u - width / 2, base.v - width / 4);
    path.lineTo(base.u, base.v - width / 2);
    path.lineTo(base.u, base.v - width / 2);
    path.lineTo(base.u + width / 2, base.v - width / 4);
    path.lineTo(base.u, base.v);
    return path;
  }

  private drawTopFace(x: number, y: number, z: number, width: number, origin: ScreenCoord, context: CanvasRenderingContext2D, override?: Color): void {
    const path = this.createTopFacePath(x, y, z, width, origin);
    context.fillStyle = override || '#ccc';
    context.fill(path);
    if (STROKE) {
      context.lineWidth = STROKE_WIDTH;
      context.strokeStyle = STROKE_COLOR;
      context.stroke(path);
    }
  }

  private createRightFacePath(x: number, y: number, z: number, width: number, origin: ScreenCoord): Path2D {
    const base = this.convertToScreen(x, y, z, width);
    base.u += origin.u;
    base.v += origin.v;
    const path = new Path2D();
    path.moveTo(base.u, base.v);
    path.lineTo(base.u + width / 2, base.v - width / 4);
    path.lineTo(base.u + width / 2, base.v - width / 4);
    path.lineTo(base.u + width / 2, base.v + width / 4);
    path.lineTo(base.u, base.v + width / 2);
    path.lineTo(base.u, base.v);
    return path;
  }

  private drawRightFace(x: number, y: number, z: number, width: number, origin: ScreenCoord, context: CanvasRenderingContext2D, override?: Color): void {
    const path = this.createRightFacePath(x, y, z, width, origin);
    context.fillStyle = override || '#eee';
    context.fill(path);
    if (STROKE) {
      context.lineWidth = STROKE_WIDTH;
      context.strokeStyle = STROKE_COLOR;
      context.stroke(path);
    }
  }

  private createLeftFacePath(x: number, y: number, z: number, width: number, origin: ScreenCoord): Path2D {
    const base = this.convertToScreen(x, y, z, width);
    base.u += origin.u;
    base.v += origin.v;
    const path = new Path2D();
    path.moveTo(base.u, base.v);
    path.lineTo(base.u, base.v + width / 2);
    path.lineTo(base.u - width / 2, base.v + width / 4);
    path.lineTo(base.u - width / 2, base.v - width / 4);
    path.lineTo(base.u, base.v);
    return path;
  }

  private drawLeftFace(x: number, y: number, z: number, width: number, origin: ScreenCoord, context: CanvasRenderingContext2D, override?: Color): void {
    const path = this.createLeftFacePath(x, y, z, width, origin);
    context.fillStyle = override || '#aaa';
    context.fill(path);
    if (STROKE) {
      context.lineWidth = STROKE_WIDTH;
      context.strokeStyle = STROKE_COLOR;
      context.stroke(path);
    }
  }
}
