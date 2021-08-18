import { DEBUG } from '../consts';
import { ImageCoordinates, VoxelImage, VoxelImageSize } from './voxelimage';

export default class BackingImage<Type> implements VoxelImage<Type> {
  readonly size: VoxelImageSize;
  private image: Type[];

  constructor(size: VoxelImageSize, value: Type) {
    if (DEBUG && !this.isValidSize(size)) throw `Invalid size {x: ${size.x}, y: ${size.y}, z: ${size.z}}`;
    this.size = size;
    this.image = new Array(size.x * size.y * size.z);
    this.image.fill(value);
  }

  get(coords: ImageCoordinates): Type {
    if (DEBUG && !this.isValidCoordinates(coords)) throw `Invalid coordinates {x: ${coords.x}, y: ${coords.y}, z: ${coords.z}}`;
    return this.image[this.getIndex(coords)];
  }

  set(coords: ImageCoordinates, value: Type): void {
    if (DEBUG && !this.isValidCoordinates(coords)) throw `Invalid coordinates {x: ${coords.x}, y: ${coords.y}, z: ${coords.z}}`;
    this.image[this.getIndex(coords)] = value;
  }

  private getIndex(coords: ImageCoordinates): number {
    return coords.z * this.size.x * this.size.y + coords.y * this.size.x + coords.x;
  }

  private isValidSize(size: VoxelImageSize): boolean {
    return (
      Number.isInteger(size.x) && size.x > 0 &&
      Number.isInteger(size.y) && size.y > 0 &&
      Number.isInteger(size.z) && size.z > 0
    )
  }

  private isValidCoordinates(coords: ImageCoordinates): boolean {
    return (
      Number.isInteger(coords.x) && coords.x >= 0 && coords.x < this.size.x &&
      Number.isInteger(coords.y) && coords.y >= 0 && coords.y < this.size.y &&
      Number.isInteger(coords.z) && coords.z >= 0 && coords.z < this.size.z
    );
  }
};