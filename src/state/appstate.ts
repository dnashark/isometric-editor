import BackingVoxelImage from '../state/backingvoxelimage';
import Camera from './camera';
import ControllerAction, { ControllerActionState } from './controlleraction';
import { EventSource, Unlistener } from './eventsource';
import { Tool, Toolbelt } from './toolbelt';
import { ImageCoordinates, ColorVoxel, VoxelImage, ReadonlyVoxelImage } from './voxelimage';

export default class AppState {
  private image_: Camera | null = null;
  readonly imageChanged: EventSource<AppState> = new EventSource();
  private readonly closeImageActionState = ControllerAction.create(() => this.doCloseImage(), false);
  private readonly newImageActionState = ControllerAction.create(() => this.doNewImage(), true);
  private readonly setVoxelActionState = ControllerAction.create<[ImageCoordinates, ColorVoxel]>((args: [ImageCoordinates, ColorVoxel]) => this.doSetVoxel(args), false);
  private readonly setRotationActionState = ControllerAction.create<number>((args: number) => this.doSetRotation(args), false);
  private toolbelt: Toolbelt = new Toolbelt();

  get image(): ReadonlyVoxelImage | null {
    return this.image_;
  }

  selectTool(tool: Tool): void {
    this.toolbelt.select(tool);
  }

  isToolDisabled(tool: Tool): boolean {
    return !this.toolbelt.isEnabled(tool);
  }

  getSelectedTool(): Tool | null { return this.toolbelt.getSelectedTool(); }

  listenForToolSelected(listener: (tool: Tool | null) => void): Unlistener {
    return this.toolbelt.listenForSelected(listener);
  }

  listenForToolEnabled(tool: Tool, listener: (enabled: boolean) => void): Unlistener {
    return this.toolbelt.listenForEnabled(tool, listener);
  }

  getRotation(): number | null { return this.image_ ? this.image_.getDirection() : null; }

  get closeImage(): ControllerAction { return this.closeImageActionState.action; }
  get newImage(): ControllerAction { return this.newImageActionState.action; }
  get setVoxel(): ControllerAction<[ImageCoordinates, ColorVoxel]> { return this.setVoxelActionState.action; }
  get setRotation(): ControllerAction<number> { return this.setRotationActionState.action; }

  private doNewImage() {
    this.image_ = new Camera(new BackingVoxelImage({ x: 20, y: 20, z: 20 }, null));

    this.closeImageActionState.enable(true);
    this.setVoxelActionState.enable(true);
    this.setRotationActionState.enable(true);
    this.imageChanged.notify(this);
    this.toolbelt.enable(Tool.ADD, Tool.DELETE);
    this.toolbelt.select(Tool.ADD);
  }

  private doCloseImage() {
    if (this.image_ == null) return;
    this.image_ = null;
    this.closeImageActionState.enable(false);
    this.setVoxelActionState.enable(false);
    this.setRotationActionState.enable(false);
    this.imageChanged.notify(this);
    this.toolbelt.disable(Tool.ADD, Tool.DELETE);
    this.toolbelt.select(null);
  }

  private doSetVoxel(args: [ImageCoordinates, ColorVoxel]) {
    if (this.image_ == null) return;
    this.image_.set(...args);
  }

  private doSetRotation(args: number) {
    if (this.image_ == null) return;
    this.image_.setDirection(args);
    this.imageChanged.notify(this);
  }
}