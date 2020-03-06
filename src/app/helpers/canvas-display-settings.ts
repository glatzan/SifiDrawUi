export class CanvasDisplaySettings {
  drawMode = CanvasDrawMode.LineMode;
  displayLayer = true;
  eraserSize = 40;
  enableDrawing = true;
  flickerTimer = 500;
}

export enum CanvasDrawMode {
  PointMode,
  LineMode
}
