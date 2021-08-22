import { ColorVoxel, ImageCoordinates, VoxelImage, VoxelImageSize } from "./voxelimage";

export default class Camera implements VoxelImage {
  private readonly backingImage: VoxelImage;
  private direction: number = 0;

  constructor(backingImage: VoxelImage) {
    this.backingImage = backingImage;
  }

  getDirection(): number { return this.direction; }
  setDirection(value: number): void {
    if (!Number.isInteger(value) || value < 0 || value >= 4) throw 'Direction is expected to be 0, 1, 2, or 3';
    this.direction = value;
  }

  get size(): VoxelImageSize { return this.backingImage.size; }

  get(coords: ImageCoordinates): ColorVoxel { return this.backingImage.get(this.transform(coords)); }

  set(coords: ImageCoordinates, value: ColorVoxel): void { this.backingImage.set(this.transform(coords), value); }

  private transform(coords: ImageCoordinates): ImageCoordinates {
    if (this.direction == 0) {
      return coords;
    } else if (this.direction == 1) {
      return { x: this.size.y - coords.y - 1, y: coords.x, z: coords.z };
    } else if (this.direction == 2) {
      return { x: this.size.x - coords.x - 1, y: this.size.y - coords.y - 1, z: coords.z };
    } else {
      return { x: coords.y, y: this.size.x - coords.x - 1, z: coords.z };
    }
  }
}