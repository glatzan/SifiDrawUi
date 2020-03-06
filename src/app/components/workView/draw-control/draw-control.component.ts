import {Component, OnInit} from '@angular/core';
import {Layer} from '../../../model/layer';
import {WorkViewService} from '../work-view.service';
import CImageUtil from '../../../utils/cimage-util';
import {ICImage} from "../../../model/ICImage";
import {LayerType} from "../../../model/layer-type.enum";
import {CanvasDisplaySettings} from "../../../helpers/canvas-display-settings";

@Component({
  selector: 'app-draw-control',
  templateUrl: './draw-control.component.html',
  styleUrls: ['./draw-control.component.scss']
})
export class DrawControlComponent implements OnInit {

  image: ICImage;

  currentLayer: Layer;

  renderComponent = false;

  displaySettings: CanvasDisplaySettings;

  layerTypes = LayerType;

  constructor(private workViewService: WorkViewService) {
  }

  ngOnInit() {
    this.displaySettings = this.workViewService.getDisplaySettings();

    this.workViewService.onChangedParentImage.subscribe(image => {
      this.image = image;
    });

    this.workViewService.onChangedActiveImage.subscribe( image => {
      this.image = image;
    });

    this.workViewService.onLayerChange.subscribe(x => {
      this.currentLayer = x;
      this.renderComponent = true;
    });
  }

  public onLayerChange($event) {
    this.workViewService.selectLayer(this.currentLayer);
  }

  public onChange($event) {
    this.workViewService.onDisplayImageRedraw.emit();
    this.workViewService.saveContent();
  }

  public onAddLayer($event) {
    this.currentLayer = CImageUtil.addLayer(this.image);
    this.onChange($event);
    this.onLayerChange($event);
  }

  public onRemoveLayer($event) {
    CImageUtil.removeLayer(this.image, this.currentLayer.id);

    if (this.image.getLayers().length === 0)
      CImageUtil.addLayer(this.image);

    this.currentLayer = this.image.getLayers()[0];
    this.onChange($event);
    this.onLayerChange($event);
  }

  public onDisplaySettingsChanged($event) {
    this.workViewService.onDisplaySettingsChanged.emit(this.displaySettings);
  }

  public onHighlightLine(id: number, highlight: boolean) {
    this.workViewService.highlightLineOfLayer.emit(highlight ? this.currentLayer.lines[id] : null);
  }

  public onSelectSubLine($event, id: number) {
    if ($event.ctrlKey) {
      CImageUtil.removeLine(this.currentLayer, this.currentLayer.lines[id]);
      this.onChange($event)
    } else {
      this.currentLayer.line = this.currentLayer.lines[id];
    }
    // preventing default ctrl click
    return $event.preventDefault() && false;
  }
}

