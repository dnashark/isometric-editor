import React from "react";
import { createRef } from "react";
import BackingImage from "../viewport/backingvoxelimage";
import VectorRenderer from "../viewport/vectorrenderer";
import ViewportController from "../viewport/viewportcontroller";
import { ColorVoxel } from "../viewport/voxelimage";

// TODO: Should pass down stuff for controller
interface ViewportComponentProps {
  width: number,
  height: number,
};

export default class ViewportComponent extends React.Component<ViewportComponentProps> {
  private canvasRef = createRef<HTMLCanvasElement>();
  private viewportController: ViewportController | null = null;

  render() {
    return <canvas
      ref={this.canvasRef}
      width={this.props.width}
      height={this.props.height}
      style={{ border: '1px solid black' }}
      onMouseMove={this.onMouseMove.bind(this)}></canvas>
  }

  componentDidMount() {
    const voxelImage = new BackingImage<ColorVoxel>({ x: 20, y: 20, z: 20 }, null);
    for (let x of [10, 11, 12]) {
      for (let y of [10, 11, 12]) {
        voxelImage.set({ x, y, z: 0 }, {r: .7, g: .7, b: .1});
      }
    }
    voxelImage.set({ x: 11, y: 11, z: 1 }, {r: .7, g: .1, b: .7});
    const renderer = new VectorRenderer();
    this.viewportController = new ViewportController(this.canvasRef.current!, voxelImage, renderer);
  }

  onMouseMove(event: React.MouseEvent<HTMLCanvasElement>) {
    // TODO: Is this correct?
    this.viewportController?.onMouseMove(
      event.clientX - this.canvasRef.current!.offsetLeft,
      event.clientY - this.canvasRef.current!.offsetTop);
  }
}
