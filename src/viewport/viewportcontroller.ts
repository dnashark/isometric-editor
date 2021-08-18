import Renderer, { Face, Facing, Lighting, ScreenParameters } from "./renderer";
import { ColorVoxel, VoxelImage } from "./voxelimage";

export default class ViewportController {
  private renderer: Renderer;
  private canvas: HTMLCanvasElement;
  private image: VoxelImage<ColorVoxel>;
  private hitTestedFace: Face | null = null;
  private viewport: ScreenParameters = { boxDiagonalWidth: 25, origin: { u: 250, v: 250 } };
  private lighting: Lighting = {
    [Facing.LEFT]: .6,
    [Facing.TOP]: .85,
    [Facing.RIGHT]: 1,
  };
  

  constructor(canvas: HTMLCanvasElement, image: VoxelImage<ColorVoxel>, renderer: Renderer) {
    this.canvas = canvas;
    this.image = image;
    this.renderer = renderer;

    this.render();
  }

  onMouseMove(u: number, v: number) {
    const context = this.getContext();
    const newHitTestedFace = this.renderer.hitTest({
      ctx: this.getContext(),
      image: this.image,
      viewport: this.viewport,
      coords: { u, v, },
    });

    // TODO: Clean this ugly logic up
    if (!!newHitTestedFace != !!this.hitTestedFace) {
      this.hitTestedFace = newHitTestedFace;
      this.render();
    } else if (newHitTestedFace && this.hitTestedFace && (
      newHitTestedFace.coords.x != this.hitTestedFace.coords.x || newHitTestedFace.coords.y != this.hitTestedFace.coords.y ||
      newHitTestedFace.coords.z != this.hitTestedFace.coords.z || newHitTestedFace.facing != this.hitTestedFace.facing)
    ) {
      this.hitTestedFace = newHitTestedFace;
      this.render();
    }
  }

  private render() {
    this.renderer.render({
      ctx: this.getContext(),
      image: this.image,
      lighting: this.lighting,
      viewport: this.viewport,
      stroke: { width: 1, color: '#000' },
      intercept: { stroke: { width: 1, color: '#555' }, fill: '#fff' },
      overrides: this.hitTestedFace ? [{ face: this.hitTestedFace, color: 'red' }] : undefined,
    });
  }

  private getContext(): CanvasRenderingContext2D {
    return this.canvas.getContext('2d')!;
  }
}