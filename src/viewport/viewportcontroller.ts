import Renderer, { areFacesEqual, Face, Facing, getCoordsOpposingFace, Lighting, ScreenCoordinates, ScreenParameters } from "./renderer";
import { ColorVoxel, isInImage, ReadonlyVoxelImage, VoxelImage } from "../state/voxelimage";
import AppState from "../state/appstate";
import { Tool } from "../state/toolbelt";
import { isJSDocThisTag } from "typescript";

export default class ViewportController {
  private renderer: Renderer;
  private canvas: HTMLCanvasElement;
  private appState: AppState;
  private hitTestedFace: Face | null = null;
  private viewport: ScreenParameters = { boxDiagonalWidth: 25, origin: { u: 250, v: 250 } };
  private lighting: Lighting = {
    [Facing.LEFT]: .6,
    [Facing.TOP]: .85,
    [Facing.RIGHT]: 1,
  };
  private mouseCoordinates: ScreenCoordinates | null = null;


  constructor(canvas: HTMLCanvasElement, appState: AppState, renderer: Renderer) {
    this.canvas = canvas;
    this.appState = appState;
    this.renderer = renderer;

    this.render();
  }

  onMouseMove(coords: ScreenCoordinates) {
    if (!this.appState.image) return;

    this.mouseCoordinates = coords;
    this.updateCursor();
  }

  onMouseDown(coords: ScreenCoordinates) {
    if (!this.appState.image) return;

    this.mouseCoordinates = coords;
    const face = this.hitTest(this.mouseCoordinates);
    if (!face) return;

    if (this.appState.getSelectedTool() == Tool.ADD) {
      const coords = getCoordsOpposingFace(face);
      if (isInImage(coords, this.appState.image.size) && !this.appState.image.get(coords)) {
        this.appState.image.set(coords, { r: 0, g: 1, b: 0 });
        this.updateCursor(true);
      }
    } else if (this.appState.getSelectedTool() == Tool.DELETE) {
      if (isInImage(face.coords, this.appState.image.size) && this.appState.image.get(face.coords)) {
        this.appState.image.set(face.coords, null);
        this.updateCursor(true);
      }
    }
  }

  private render() {
    if (!this.appState.image) return;

    this.renderer.render({
      ctx: this.getContext(),
      image: this.appState.image,
      lighting: this.lighting,
      viewport: this.viewport,
      stroke: { width: 1, color: '#000' },
      intercept: { stroke: { width: 1, color: '#555' }, fill: '#fff' },
      overrides: this.hitTestedFace ? [{ face: this.hitTestedFace, color: 'red' }] : undefined,
    });
  }

  private updateCursor(forceUpdate: boolean = false) {
    if (!this.appState.image) return;
    if (!this.mouseCoordinates) return;

    const newHitTestedFace = this.hitTest(this.mouseCoordinates);

    const isSameFace = (!this.hitTestedFace && !newHitTestedFace) ||
      (this.hitTestedFace && newHitTestedFace && areFacesEqual(this.hitTestedFace, newHitTestedFace));
    if (forceUpdate || !isSameFace) {
      this.hitTestedFace = newHitTestedFace;
      this.render();
    }
  }

  private hitTest(coords: ScreenCoordinates): Face | null {
    return this.renderer.hitTest({
      ctx: this.getContext(),
      image: this.appState.image!,
      viewport: this.viewport,
      coords,
    });
  }

  private getContext(): CanvasRenderingContext2D {
    return this.canvas.getContext('2d')!;
  }
}