import CoordinateFace from '../components/coordinateface';
import Renderer from './renderer';
import { VoxelImage } from './voxelimage';
import Face from './face';

type ScreenCoord = { u: number, v: number };

const WIDTH = 25;
const STROKE = true;
const STROKE_WIDTH = .5;
const STROKE_COLOR = '#000';
const ORIGIN = { u: 250, v: 250 };
const SHOW_BACK = true;

export default class VectorRenderer implements Renderer {
  render(voxelImage: VoxelImage<boolean>, hitTestedFace: CoordinateFace | null, context: CanvasRenderingContext2D): void {
    if (SHOW_BACK) {
      for (let x = 0; x < voxelImage.size.x; x++) {
        for (let y = 0; y < voxelImage.size.y; y++) {
          const voxelHit = x == hitTestedFace?.x && y == hitTestedFace?.y && -1 == hitTestedFace?.z;
          this.drawTopFace(x, y, -1, WIDTH, ORIGIN, context, voxelHit && hitTestedFace?.face == Face.TOP);
        }
      }
      for (let x = 0; x < voxelImage.size.x; x++) {
        for (let z = 0; z < voxelImage.size.z; z++) {
          const voxelHit = x == hitTestedFace?.x && -1 == hitTestedFace?.y && z == hitTestedFace?.z;
          this.drawLeftFace(x, -1, z, WIDTH, ORIGIN, context, voxelHit && hitTestedFace?.face == Face.LEFT);
        }
      }
      for (let y = 0; y < voxelImage.size.y; y++) {
        for (let z = 0; z < voxelImage.size.z; z++) {
          const voxelHit = -1 == hitTestedFace?.x && y == hitTestedFace?.y && z == hitTestedFace?.z;
          this.drawRightFace(-1, y, z, WIDTH, ORIGIN, context, voxelHit && hitTestedFace?.face == Face.RIGHT);
        }
      }
    }
    for (let z = 0; z < voxelImage.size.z; z++) {
      for (let y = 0; y < voxelImage.size.y; y++) {
        for (let x = 0; x < voxelImage.size.x; x++) {
          if (voxelImage.get(x, y, z)) {
            const voxelHit = x == hitTestedFace?.x && y == hitTestedFace?.y && z == hitTestedFace?.z;
            this.drawLeftFace(x, y, z, WIDTH, ORIGIN, context, voxelHit && hitTestedFace?.face == Face.LEFT);
            this.drawRightFace(x, y, z, WIDTH, ORIGIN, context, voxelHit && hitTestedFace?.face == Face.RIGHT);
            this.drawTopFace(x, y, z, WIDTH, ORIGIN, context, voxelHit && hitTestedFace?.face == Face.TOP);
          }
        }
      }
    }
  }

  hitTest(voxelImage: VoxelImage<boolean>, u: number, v: number, context: CanvasRenderingContext2D): CoordinateFace | null {
    for (let z = voxelImage.size.z - 1; z >= 0; z--) {
      for (let y = voxelImage.size.y - 1; y >= 0; y--) {
        for (let x = voxelImage.size.x - 1; x >= 0; x--) {
          if (voxelImage.get(x, y, z)) {
            const leftFace = this.createLeftFacePath(x, y, z, WIDTH, ORIGIN);
            if (context.isPointInPath(leftFace, u, v)) return { x, y, z, face: Face.LEFT };
            const rightFace = this.createRightFacePath(x, y, z, WIDTH, ORIGIN);
            if (context.isPointInPath(rightFace, u, v)) return { x, y, z, face: Face.RIGHT };
            const topFace = this.createTopFacePath(x, y, z, WIDTH, ORIGIN);
            if (context.isPointInPath(topFace, u, v)) return { x, y, z, face: Face.TOP };
          }
        }
      }
    }
    for (let x = 0; x < voxelImage.size.x; x++) {
      for (let y = 0; y < voxelImage.size.y; y++) {
        const topFace = this.createTopFacePath(x, y, -1, WIDTH, ORIGIN);
        if (context.isPointInPath(topFace, u, v)) return { x, y, z: -1, face: Face.TOP };
      }
    }
    for (let x = 0; x < voxelImage.size.x; x++) {
      for (let z = 0; z < voxelImage.size.z; z++) {
        const leftFace = this.createLeftFacePath(x, -1, z, WIDTH, ORIGIN);
        if (context.isPointInPath(leftFace, u, v)) return { x, y: -1, z, face: Face.LEFT };
      }
    }
    for (let y = 0; y < voxelImage.size.y; y++) {
      for (let z = 0; z < voxelImage.size.z; z++) {
        const rightFace = this.createRightFacePath(-1, y, z, WIDTH, ORIGIN);
        if (context.isPointInPath(rightFace, u, v)) return { x: -1, y, z, face: Face.RIGHT };
      }
    }
    return null;
  }

  private convertToScreen(x: number, y: number, z: number, width: number): ScreenCoord {
    return {
      u: (x - y) * width / 2,
      v: (x + y - 2 * z) * width / 4,
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

  private drawTopFace(x: number, y: number, z: number, width: number, origin: ScreenCoord, context: CanvasRenderingContext2D, highlight: boolean): void {
    const path = this.createTopFacePath(x, y, z, width, origin);
    context.fillStyle = highlight ? '#f00' : '#ccc';
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

  private drawRightFace(x: number, y: number, z: number, width: number, origin: ScreenCoord, context: CanvasRenderingContext2D, highlight: boolean): void {
    const path = this.createRightFacePath(x, y, z, width, origin);
    context.fillStyle = highlight ? '#f00' : '#eee';
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

  private drawLeftFace(x: number, y: number, z: number, width: number, origin: ScreenCoord, context: CanvasRenderingContext2D, highlight: boolean): void {
    const path = this.createLeftFacePath(x, y, z, width, origin);
    context.fillStyle = highlight ? '#f00' : '#aaa';
    context.fill(path);
    if (STROKE) {
      context.lineWidth = STROKE_WIDTH;
      context.strokeStyle = STROKE_COLOR;
      context.stroke(path);
    }
  }
}
