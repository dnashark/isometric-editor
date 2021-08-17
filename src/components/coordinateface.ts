import Face from "../viewport/face";

interface CoordinateFace {
  readonly x: number,
  readonly y: number,
  readonly z: number,
  readonly face: Face,
}

export default CoordinateFace;