import BackingVoxelImage from '../state/backingvoxelimage';
import ControllerAction, { ControllerActionState } from './controlleraction';
import { EventSource, Unlistener } from './eventsource';
import { Tool, Toolbelt } from './toolbelt';
import { ImageCoordinates, ColorVoxel } from './voxelimage';

export default class AppState {
  private image_: BackingVoxelImage | null = null;
  readonly imageChanged: EventSource<AppState> = new EventSource();
  private readonly closeImageActionState = ControllerAction.create(() => this.doCloseImage(), false);
  private readonly newImageActionState = ControllerAction.create(() => this.doNewImage(), true);
  private readonly setVoxelActionState = ControllerAction.create<[ImageCoordinates, ColorVoxel]>((args: [ImageCoordinates, ColorVoxel]) => this.doSetVoxel(args), false);
  private toolbelt: Toolbelt = new Toolbelt();

  get image(): BackingVoxelImage | null {
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

  get closeImage(): ControllerAction { return this.closeImageActionState.action; }
  get newImage(): ControllerAction { return this.newImageActionState.action; }

  private doNewImage() {
    this.image_ = new BackingVoxelImage({ x: 20, y: 20, z: 20 }, null);
    for (let x of [10, 11, 12]) {
      for (let y of [10, 11, 12]) {
        this.image_.set({ x, y, z: 0 }, { r: .7, g: .7, b: .1 });
      }
    }
    this.image_.set({ x: 11, y: 11, z: 1 }, { r: .7, g: .1, b: .7 });
    this.closeImageActionState.enable(true);
    this.imageChanged.notify(this);
    this.toolbelt.enable(Tool.ADD, Tool.DELETE);
    this.toolbelt.select(Tool.ADD);
  }

  private doCloseImage() {
    if (this.image_ == null) return;
    this.image_ = null;
    this.closeImageActionState.enable(false);
    this.imageChanged.notify(this);
    this.toolbelt.disable(Tool.ADD, Tool.DELETE);
    this.toolbelt.select(null);
  }

  private doSetVoxel(args: [ImageCoordinates, ColorVoxel]) {
    if (this.image_ == null) return;
    this.image_.set(...args);
  }
}