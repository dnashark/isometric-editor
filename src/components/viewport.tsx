import React, { useEffect } from "react";
import { createRef } from "react";
import { useRef, Ref } from "react"
import { JsxElement } from "typescript";
import BackingImage from "../viewport/backingvoxelimage";
import Renderer from "../viewport/renderer";
import VectorRenderer from "../viewport/vectorrenderer";
import ViewportController from "../viewport/viewportcontroller";

// TODO: Should pass down stuff for controller
interface ViewportComponentProps {
  width: number,
  height: number,
};

export default class ViewportComponent extends React.Component<ViewportComponentProps> {
  private canvasRef = createRef<HTMLCanvasElement>();
  private viewportController: ViewportController|null = null;

  render() {
    return <canvas
      ref={this.canvasRef}
      width={this.props.width}
      height={this.props.height}
      style={{ border: '1px solid black' }}></canvas>
  }

  componentDidMount() {
    const voxelImage = new BackingImage(5, 5, 5, false);
    voxelImage.set(1, 0, 0, true);
    voxelImage.set(0, 1, 0, true);
    voxelImage.set(0, 0, 1, true);
    const renderer = new VectorRenderer();
    this.viewportController = new ViewportController(this.canvasRef.current!, voxelImage, renderer);
  }
}
