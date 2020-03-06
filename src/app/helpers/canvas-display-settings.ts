export class CanvasDisplaySettings {
  drawMode = CanvasDrawMode.LineMode;
  displayLayer = true;
  eraserSize = 40;
  enableDrawing = true;
}

export enum CanvasDrawMode {
  PointMode,
  LineMode
}
