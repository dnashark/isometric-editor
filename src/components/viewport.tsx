import React from "react";
import { createRef } from "react";
import BackingImage from "../state/backingvoxelimage";
import VectorRenderer from "../viewport/vectorrenderer";
import ViewportController from "../viewport/viewportcontroller";
import { ColorVoxel } from "../state/voxelimage";
import './viewport.css';
import AppState from "../state/appstate";
import { Unlistener } from "../state/eventsource";

interface ViewportComponentProps {
  appState: AppState,
};

interface ViewportComponentState {
  showCanvas: boolean,
}

// TODO: Handle resizing

export default class ViewportComponent extends React.Component<ViewportComponentProps, ViewportComponentState> {
  private canvasRef = createRef<HTMLCanvasElement>();
  private viewportController: ViewportController | null = null;
  private imageChangedUnlistener: Unlistener | null = null;

  constructor(props: ViewportComponentProps) {
    super(props);
    this.state = {
      showCanvas: !!props.appState.image,
    };
  }

  render() {
    return !this.state.showCanvas ? null : (
      <canvas id="viewport" ref={this.canvasRef} onMouseMove={this.onMouseMove.bind(this)}></canvas>
    );
  }

  componentDidMount() {
    this.updateViewportController(this.props.appState);
    if (this.state.showCanvas) {
      this.canvasRef.current!.width = this.canvasRef.current!.clientWidth;
      this.canvasRef.current!.height = this.canvasRef.current!.clientHeight;
    }

    this.imageChangedUnlistener = this.props.appState.imageChanged.listen(
      () => this.onImageChanged(this.props.appState));
  }

  componentDidUpdate(prevProps: ViewportComponentProps) {
    if (this.props.appState != prevProps.appState) throw 'We should never change AppState.';

    if (this.state.showCanvas) {
      this.canvasRef.current!.width = this.canvasRef.current!.clientWidth;
      this.canvasRef.current!.height = this.canvasRef.current!.clientHeight;
    }
  }

  componentWillUnmount() {
    this.viewportController = null;
    if (this.imageChangedUnlistener) {
      this.imageChangedUnlistener();
      this.imageChangedUnlistener = null;
    }
  }

  private onImageChanged(appState: AppState) {
    this.setState({ showCanvas: !!appState.image }, () => {
      this.updateViewportController(appState);
    });
  }

  private onMouseMove(event: React.MouseEvent<HTMLCanvasElement>) {
    // TODO: Is this correct?
    const boundingRect = this.canvasRef.current!.getBoundingClientRect();
    this.viewportController!.onMouseMove(
      event.clientX - boundingRect.x,
      event.clientY - boundingRect.y);
  }

  private updateViewportController(appState: AppState) {
    const image = appState.image;
    this.viewportController = image
      ? new ViewportController(this.canvasRef.current!, image, new VectorRenderer())
      : null;
  }
}
