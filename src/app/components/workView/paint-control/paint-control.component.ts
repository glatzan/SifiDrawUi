import {Component, OnInit} from '@angular/core';
import {Layer} from '../../../model/layer';
import {WorkViewService} from '../work-view.service';
import {CImage} from '../../../model/CImage';
import CImageUtil from '../../../utils/cimage-util';

@Component({
  selector: 'app-paint-control',
  templateUrl: './paint-control.component.html',
  styleUrls: ['./paint-control.component.scss']
})
export class PaintControlComponent implements OnInit {

  private image: CImage;

  private pointMode = 'false';

  private hideLines = false;

  private currentLayer: Layer;

  private rightClickCircle = 40;

  private renderContext = false;

  constructor(private workViewService: WorkViewService) {
  }

  /**
   * Event for loading a new Image
   */
  ngOnInit() {
    this.workViewService.changeImage.subscribe(image => {
      this.init(image);
    });

    this.workViewService.changeImageAndReload.subscribe(image => {
      this.init(image);
    });
  }

  private init(image: CImage) {
    this.image = image;
    this.currentLayer = image.layers[0];
    this.renderContext = true;
  }

  public onChangeMode($event) {
    this.workViewService.pointModeChanged.emit(this.pointMode === 'true');
  }

  public onHideLines($event) {
    console.log(this.hideLines);
    this.workViewService.hideLines.emit(this.hideLines);
  }

  public onLayerChange($event) {
    this.workViewService.selectLayer.emit(this.currentLayer);
    console.log('chage to' + this.currentLayer.id);
  }

  public onAddLayer($event) {
    this.currentLayer = CImageUtil.addLayer(this.image);
    this.workViewService.selectLayer.emit(this.currentLayer);
  }

  public onChangeColorOrThickness($event) {
    console.log('redarw');
    this.workViewService.saveAndRedrawImage.emit(true);
  }

  public onHighlightLine(id: number, highlight: boolean) {
    if (highlight) {
      this.workViewService.highlightLine.emit(this.currentLayer.lines[id]);
    } else {
      this.workViewService.highlightLine.emit(null);
    }
  }

  public onSelectSubLine($event, id: number) {
    if ($event.ctrlKey) {
      CImageUtil.removeLine(this.currentLayer, this.currentLayer.lines[id]);
      this.workViewService.saveAndRedrawImage.emit(true);
    } else {
      this.currentLayer.line = this.currentLayer.lines[id];
    }

    // preventing default ctrl click
    return $event.preventDefault() && false;
  }

  public onEraserSizeChange($event) {
    console.log(this.rightClickCircle)
    this.workViewService.eraserSizeChange.emit(this.rightClickCircle);
  }


}

