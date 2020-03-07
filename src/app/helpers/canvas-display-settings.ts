export class CanvasDisplaySettings {
  drawMode = CanvasDrawMode.LineMode;
  displayLayer = true;
  eraserSize = 40;
  enableDrawing = true;
  oldStatusEnableDrawing = true;
  enableDrawingSliderDisabled = false;
  flickerTimer = 500;
}

export enum CanvasDrawMode {
  PointMode,
  LineMode
}
