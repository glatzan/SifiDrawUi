import {Layer} from "../../../model/layer";
import {Point} from "../../../model/point";
import {CImage} from "../../../model/CImage";
import CImageUtil from "../../../utils/cimage-util";

export class CanvasHistory {

  history: DrawHistory[] = [];

  addHistoryForPoint(layer: Layer, action: CanvasDrawAction, lines: { lineIndex: number, oldPosition: Point[], newPosition: Point[] }[], merge: boolean = true) {
    this.addHistoryForPoints(layer, action, lines, merge);
  }

  addHistoryForPoints(layer: Layer, action: CanvasDrawAction, lines: { lineIndex: number, oldPosition: Point[], newPosition: Point[] }[], merge: boolean = true) {

    if (this.history.length > 0 && merge) {
      const lastHistory: DrawHistory = this.history[this.history.length - 1];
      if (lastHistory.layer.id === layer.id && lastHistory.action === action) {
        lines.forEach(x => this.addLineHistory(lastHistory, x));
        return;
      }
    }

    const newHistory = new DrawHistory();
    newHistory.layer = layer;
    newHistory.lines = [];
    lines.forEach(x => this.addLineHistory(newHistory, x));
    newHistory.action = action;

    this.history.push(newHistory);

    if(this.history.length > 150){
      this.history.splice(0,1);
    }
  }

  private addLineHistory(historyData: DrawHistory, line: { lineIndex: number, oldPosition: Point[], newPosition: Point[] }) {
    for (let l of historyData.lines) {
      if (l.lineIndex === line.lineIndex) {
        if (l.oldPosition)
          l.oldPosition = l.oldPosition.concat(line.oldPosition);
        if (l.newPosition)
          l.newPosition = l.newPosition.concat(line.newPosition);
        return;
      }
    }

    const newLineHistory = new LineHistory();
    newLineHistory.lineIndex = line.lineIndex;
    newLineHistory.oldPosition = line.oldPosition;
    newLineHistory.newPosition = line.newPosition;

    historyData.lines.push(newLineHistory);

  }

  getLastAction(): DrawHistory {
    return this.history.pop();
  }

  undoLastAction(image: CImage) {
    const lastAction = this.getLastAction();
    if (lastAction) {
      switch (lastAction.action) {
        case CanvasDrawAction.New:
          for (let lineHistory of lastAction.lines) {
            const line = lastAction.layer.lines[lineHistory.lineIndex];
            lineHistory.newPosition.forEach(point => {
              CImageUtil.removePointFromLine(line, point)
            });
          }
          break;
        case CanvasDrawAction.Delete:
          for (let lineHistory of lastAction.lines) {
            const line = lastAction.layer.lines[lineHistory.lineIndex];
            CImageUtil.addPointsToLineAtPosition(line, lineHistory.oldPosition);
            CImageUtil.updatePointOrder(line);
          }
          break;
      }
    }
  }
}

export enum CanvasDrawAction {
  New,
  Delete,
  Move
}


class DrawHistory {
  public layer: Layer;
  public action: CanvasDrawAction;
  public lines: LineHistory[];
}

export class LineHistory {
  public lineIndex: number;
  public oldPosition: Point[];
  public newPosition: Point[];

  constructor()
  constructor(oldPosition: Point[], newPosition: Point[])
  constructor(oldPosition: Point[], newPosition: Point[], lineIndex : number)
  constructor(oldPosition?: Point[], newPosition?: Point[], lineIndex? : number) {
    this.oldPosition = oldPosition;
    this.newPosition = newPosition;
    this.lineIndex = lineIndex;
  }

  isContent() {
    return (this.oldPosition != null && this.oldPosition.length > 0) || (this.newPosition != null && this.newPosition.length > 0)
  }
}
