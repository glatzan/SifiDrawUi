import {Component, OnInit} from '@angular/core';
import {Layer} from '../../../model/layer';
import {WorkViewService} from '../work-view.service';
import CImageUtil from '../../../utils/cimage-util';
import {ICImage} from "../../../model/ICImage";
import {CImageGroup} from "../../../model/CImageGroup";
import {LayerType} from "../../../model/layer-type.enum";

@Component({
  selector: 'app-draw-control',
  templateUrl: './draw-control.component.html',
  styleUrls: ['./draw-control.component.scss']
})
export class DrawControlComponent implements OnInit {

  image: ICImage;

  pointMode = 'false';

  hideLines = false;

  currentLayer: Layer;

  rightClickCircle = 40;

  renderContext = false;

  layerTypes = LayerType;

  constructor(private workViewService: WorkViewService) {
  }

  /**
   * Event for loading a new Image
   */
  ngOnInit() {
    this.workViewService.changeDisplayImage.subscribe(image => {
      this.init(image);
    });

    this.workViewService.changeParentImageOrGroup.subscribe(image => {
      this.init(image);
    });
  }

  private init(image: ICImage) {
    this.image = image;
    if (image instanceof CImageGroup && image.images.length === 0) {
      console.log('Empty Image');
      this.currentLayer = new Layer('-');
    } else {
      this.currentLayer = image.getLayers()[0];
      this.renderContext = true;
    }
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
    this.workViewService.saveAndRedrawImage.emit(true);
  }

  public onRemoveLayer($event) {
    CImageUtil.removeLayer(this.image, this.currentLayer.id);

    if (this.image.getLayers().length === 0)
      CImageUtil.addLayer(this.image)

    this.currentLayer = this.image.getLayers()[0];
    this.workViewService.selectLayer.emit(this.currentLayer);
    this.workViewService.saveAndRedrawImage.emit(true);
  }

  public onChangeColorOrThickness($event) {
    console.log(this.currentLayer)
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

