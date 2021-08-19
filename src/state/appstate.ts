import BackingVoxelImage from '../state/backingvoxelimage';
import { ColorVoxel } from '../state/voxelimage';
import AppEvents from './appevents';
import ControllerAction, { ControllerActionState } from './controlleraction';
import { EventSource } from './eventsource';

export default class AppState {
  private image_: BackingVoxelImage<ColorVoxel> | null = null;
  readonly imageChanged: EventSource<AppState> = new EventSource();
  private readonly closeImageActionState = ControllerAction.create(() => this.doCloseImage(), false);
  private readonly newImageActionState = ControllerAction.create(() => this.doNewImage(), true);

  get image(): BackingVoxelImage<ColorVoxel> | null {
    return this.image_;
  }

  get closeImage(): ControllerAction { return this.closeImageActionState.action; }
  get newImage(): ControllerAction { return this.newImageActionState.action; }

  private doNewImage() {
    this.image_ = new BackingVoxelImage<ColorVoxel>({ x: 20, y: 20, z: 20 }, null);
    for (let x of [10, 11, 12]) {
      for (let y of [10, 11, 12]) {
        this.image_.set({ x, y, z: 0 }, { r: .7, g: .7, b: .1 });
      }
    }
    this.image_.set({ x: 11, y: 11, z: 1 }, { r: .7, g: .1, b: .7 });
    this.closeImageActionState.enable(true);
    this.imageChanged.notify(this);
  }

  private doCloseImage() {
    if (this.image == null) return;
    this.image_ = null;
    this.closeImageActionState.enable(false);
    this.imageChanged.notify(this);
  }
}