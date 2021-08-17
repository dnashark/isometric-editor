import { DEBUG } from '../consts';
import {VoxelImage, Size} from './voxelimage';

export default class BackingImage<Type> implements VoxelImage<Type> {
  readonly size: Size;
  private image: Type[];

  constructor(x: number, y: number, z: number, value: Type) {
    if (DEBUG && !this.isValidSize(x, y, z)) throw `Invalid size {x: ${x}, y: ${y}, z: ${z}}`;
    this.size = {x, y, z,};
    this.image = new Array(x * y * z);
    this.image.fill(value);
  }

  get(x: number, y: number, z: number): Type {
    if (DEBUG && !this.isValidCoordinates(x, y, z)) throw `Invalid coordinates {x: ${x}, y: ${y}, z: ${z}}`;
    return this.image[this.getIndex(x, y, z)];
  }

  set(x: number, y: number, z: number, value: Type): void {
    if (DEBUG && !this.isValidCoordinates(x, y, z)) throw `Invalid coordinates {x: ${x}, y: ${y}, z: ${z}}`;
    this.image[this.getIndex(x, y, z)] = value;
  }

  private getIndex(x: number, y: number, z: number): number {
    return z * this.size.x * this.size.y + y * this.size.x + x;
  }

  private isValidSize(x: number, y: number, z: number): boolean {
    return (
      Number.isInteger(x) && x > 0 &&
      Number.isInteger(y) && y > 0 &&
      Number.isInteger(z) && z > 0
    )
  }

  private isValidCoordinates(x: number, y: number, z: number): boolean {
    return (
      Number.isInteger(x) && x >= 0 && x < this.size.x &&
      Number.isInteger(y) && y >= 0 && y < this.size.y &&
      Number.isInteger(z) && z >= 0 && z < this.size.z
    );
  }
};