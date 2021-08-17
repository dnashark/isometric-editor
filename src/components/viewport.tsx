import React from "react";
import { createRef } from "react";
import BackingImage from "../viewport/backingvoxelimage";
import VectorRenderer from "../viewport/vectorrenderer";
import ViewportController from "../viewport/viewportcontroller";

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
    const voxelImage = new BackingImage(20, 20, 20, false);
    for (let x of [10, 11, 12]) {
      for (let y of [10, 11, 12]) {
        voxelImage.set(x, y, 0, true);
      }
    }
    voxelImage.set(11, 11, 1, true);
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
