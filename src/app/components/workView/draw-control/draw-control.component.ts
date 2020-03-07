import {Component, OnInit} from '@angular/core';
import {Layer} from '../../../model/layer';
import {WorkViewService} from '../work-view.service';
import CImageUtil from '../../../utils/cimage-util';
import {ICImage} from "../../../model/ICImage";
import {LayerType} from "../../../model/layer-type.enum";
import {CanvasDisplaySettings} from "../../../helpers/canvas-display-settings";
import {AuthenticationService} from "../../../service/authentication.service";

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

  layerClipboard: Layer[];

  constructor(private workViewService: WorkViewService,
              private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    this.displaySettings = this.workViewService.getDisplaySettings();

    this.workViewService.onChangedParentImage.subscribe(image => {
      this.image = image;
      this.renderComponent = this.image.hasData();
    });

    this.workViewService.onChangedActiveImage.subscribe( image => {
      this.image = image;
      this.renderComponent = this.image.hasData();
    });

    this.workViewService.onLayerChange.subscribe(x => {
      this.currentLayer = x;
      this.renderComponent = this.image.hasData();
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
    console.log(this.authenticationService.currentUserSettingsValue);
    this.currentLayer = CImageUtil.addLayer(this.image, this.authenticationService.currentUserSettingsValue.defaultLayerSettings);
    this.onChange($event);
    this.onLayerChange($event);
  }

  public onRemoveLayer($event) {
    CImageUtil.removeLayer(this.image, this.currentLayer.id);

    if (this.image.getLayers().length === 0)
      CImageUtil.addLayer(this.image, this.authenticationService.currentUserSettingsValue.defaultLayerSettings);

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

  isLayerClipboardEmpty() {
    return this.layerClipboard != null
  }

  copyLayersToClipboard($event) {
    this.layerClipboard = this.image.getLayers()
  }

  copyLayersFromClipboardToImage($event) {
    this.image.setLayers(this.layerClipboard);
    this.onChange(null);
    this.workViewService.restoreLastSelectedLayer()
  }
}

