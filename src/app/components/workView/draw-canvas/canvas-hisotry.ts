import {Layer} from "../../../model/layer";
import {Point} from "../../../model/point";
import {CImage} from "../../../model/CImage";
import CImageUtil from "../../../utils/cimage-util";

export class CanvasHistory {

  history: DrawHistory[] = [];

  addHistoryForPoint(layer: Layer, lineIndex: number, oldPosition: Point, newPosition: Point, action: CanvasDrawAction) {
    this.addHistoryForPoints(layer, lineIndex, [oldPosition], [newPosition], action);
  }

  addHistoryForPoints(layer: Layer, lineIndex: number, oldPosition: Point[], newPosition: Point[], action: CanvasDrawAction) {

    if (this.history.length > 0) {
      const lastHistory: DrawHistory = this.history[this.history.length - 1];
      if (lastHistory.layer.id === layer.id && lastHistory.lineIndex === lineIndex && lastHistory.action === action) {
        lastHistory.oldPosition = lastHistory.oldPosition.concat(oldPosition);
        lastHistory.newPosition = lastHistory.newPosition.concat(newPosition);
        return;
      }
    }

    const newHistory = new DrawHistory();
    newHistory.layer = layer;
    newHistory.lineIndex = lineIndex;
    newHistory.oldPosition = oldPosition;
    newHistory.newPosition = newPosition;
    newHistory.action = action;

    this.history.push(newHistory)
  }

  getLastAction(): DrawHistory {
    return this.history.pop();
  }

  undoLastAction(image: CImage) {
    const lastAction = this.getLastAction();
    if (lastAction) {
      switch (lastAction.action) {
        case CanvasDrawAction.New:
          const line = lastAction.layer.lines[lastAction.lineIndex];
          lastAction.newPosition.forEach(x => {
            CImageUtil.removePointFromLine(line, x.x, x.y)
          });
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
  public lineIndex: number;
  public oldPosition: Point[];
  public newPosition: Point[];
  public action: CanvasDrawAction;
};
