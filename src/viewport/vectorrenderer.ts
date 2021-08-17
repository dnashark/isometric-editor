import Renderer from './renderer';
import { VoxelImage } from './voxelimage';

type ScreenCoord = { u: number, v: number };

const WIDTH = 16;
const STROKE = true;
const STROKE_WIDTH = .5;
const STROKE_COLOR = '#000';

export default class VectorRenderer implements Renderer {
  render(voxelImage: VoxelImage<boolean>, context: CanvasRenderingContext2D): void {
    for (let z = 0; z < voxelImage.size.z; z++) {
      for (let y = 0; y < voxelImage.size.y; y++) {
        for (let x = 0; x < voxelImage.size.x; x++) {
          if (voxelImage.get(x, y, z)) {
            this.drawVoxel(x, y, z, context);
          }
        }
      }
    }
  }

  private drawVoxel(x: number, y: number, z: number, context: CanvasRenderingContext2D) {
    this.drawTopFace(x, y, z, WIDTH, { u: 250, v: 250 }, context);
    this.drawRightFace(x, y, z, WIDTH, { u: 250, v: 250 }, context);
    this.drawLeftFace(x, y, z, WIDTH, { u: 250, v: 250 }, context)
  }

  private convertToScreen(x: number, y: number, z: number, width: number): ScreenCoord {
    return {
      u: (x - y) * width / 2,
      v: (x + y - 2 * z) * width / 4,
    };
  }

  private drawTopFace(x: number, y: number, z: number, width: number, origin: ScreenCoord, context: CanvasRenderingContext2D): void {
    const base = this.convertToScreen(x, y, z, width);
    base.u += origin.u;
    base.v += origin.v;
    context.beginPath();
    context.moveTo(base.u, base.v - width / 2);
    context.lineTo(base.u + width / 2, base.v - width / 4);
    context.lineTo(base.u, base.v);
    context.lineTo(base.u - width / 2, base.v - width / 4);
    context.lineTo(base.u, base.v - width / 2);
    context.fillStyle = '#ccc';
    context.fill();
    if (STROKE) {
      context.lineWidth = STROKE_WIDTH;
      context.strokeStyle = STROKE_COLOR;
      context.stroke();
    }
  }

  private drawRightFace(x: number, y: number, z: number, width: number, origin: ScreenCoord, context: CanvasRenderingContext2D): void {
    const base = this.convertToScreen(x, y, z, width);
    base.u += origin.u;
    base.v += origin.v;
    context.beginPath();
    context.moveTo(base.u + width / 2, base.v - width / 4);
    context.lineTo(base.u + width / 2, base.v + width / 4);
    context.lineTo(base.u, base.v + width / 2);
    context.lineTo(base.u, base.v);
    context.lineTo(base.u + width / 2, base.v - width / 4);
    context.fillStyle = '#eee';
    context.fill();
    if (STROKE) {
      context.lineWidth = STROKE_WIDTH;
      context.strokeStyle = STROKE_COLOR;
      context.stroke();
    }
  }

  private drawLeftFace(x: number, y: number, z: number, width: number, origin: ScreenCoord, context: CanvasRenderingContext2D): void {
    const base = this.convertToScreen(x, y, z, width);
    base.u += origin.u;
    base.v += origin.v;
    context.beginPath();
    context.moveTo(base.u, base.v);
    context.lineTo(base.u, base.v + width / 2);
    context.lineTo(base.u - width / 2, base.v + width / 4);
    context.lineTo(base.u - width / 2, base.v - width / 4);
    context.lineTo(base.u, base.v);
    context.fillStyle = '#aaa';
    context.fill();
    if (STROKE) {
      context.lineWidth = STROKE_WIDTH;
      context.strokeStyle = STROKE_COLOR;
      context.stroke();
    }
  }
}
