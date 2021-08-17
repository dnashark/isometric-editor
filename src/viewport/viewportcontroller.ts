import CoordinateFace from "../components/coordinateface";
import Renderer from "./renderer";
import { VoxelImage } from "./voxelimage";

export default class ViewportController {
  private renderer: Renderer;
  private canvas: HTMLCanvasElement;
  private image: VoxelImage<boolean>;
  private hitTestedFace: CoordinateFace | null = null;

  constructor(canvas: HTMLCanvasElement, image: VoxelImage<boolean>, renderer: Renderer) {
    this.canvas = canvas;
    this.image = image;
    this.renderer = renderer;


    this.renderer.render(this.image, this.hitTestedFace, this.getContext());
  }

  onMouseMove(u: number, v: number) {
    const context = this.getContext();
    const newHitTestedFace = this.renderer.hitTest(this.image, u, v, this.getContext());

    // TODO: Clean this ugly logic up
    if (!!newHitTestedFace != !!this.hitTestedFace) {
      this.hitTestedFace = newHitTestedFace;
      this.renderer.render(this.image, this.hitTestedFace, context);
    } else if (newHitTestedFace && this.hitTestedFace && (
      newHitTestedFace.x != this.hitTestedFace.x || newHitTestedFace.y != this.hitTestedFace.y ||
      newHitTestedFace.z != this.hitTestedFace.z || newHitTestedFace?.face != this.hitTestedFace.face)
    ) {
      this.hitTestedFace = newHitTestedFace;
      this.renderer.render(this.image, this.hitTestedFace, context);
    }
  }

  private getContext(): CanvasRenderingContext2D {
    return this.canvas.getContext('2d')!;
  }
}