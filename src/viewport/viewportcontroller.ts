import Renderer from "./renderer";
import {VoxelImage} from "./voxelimage";

export default class ViewportController {
  private renderer: Renderer;
  private canvas: HTMLCanvasElement;
  private image: VoxelImage<boolean>;

  constructor(canvas: HTMLCanvasElement, image: VoxelImage<boolean>, renderer: Renderer) {
    this.canvas = canvas;
    this.image = image;
    this.renderer = renderer;

    
    this.renderer.render(this.image, this.getContext());
  }

  private getContext(): CanvasRenderingContext2D {
    return this.canvas.getContext('2d')!;
  }
}