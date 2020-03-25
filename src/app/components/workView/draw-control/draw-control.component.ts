import {Component, OnInit} from '@angular/core';
import {Layer} from '../../../model/layer';
import {WorkViewService} from '../work-view.service';
import CImageUtil from '../../../utils/cimage-util';
import {LayerType} from "../../../model/layer-type.enum";
import {CanvasDisplaySettings} from "../../../helpers/canvas-display-settings";
import {AuthenticationService} from "../../../service/authentication.service";
import {CImage} from "../../../model/CImage";

@Component({
  selector: 'app-draw-control',
  templateUrl: './draw-control.component.html',
  styleUrls: ['./draw-control.component.scss']
})
export class DrawControlComponent implements OnInit {

  activeImage: CImage;

  currentLayer: Layer;

  renderComponent = false;

  displaySettings: CanvasDisplaySettings;

  layerTypes = LayerType;

  constructor(private workViewService: WorkViewService,
              private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    this.displaySettings = this.workViewService.getDisplaySettings();

    this.workViewService.onChangedImage.subscribe(change => {
      this.activeImage = change.active;
      this.currentLayer = change.active.getLayers()[0];
      this.renderComponent = change.active.hasData();
    });

    this.workViewService.onLayerChange.subscribe(x => {
      this.currentLayer = x;
    });
  }

  onLayerChange($event) {
    this.workViewService.selectLayer(this.currentLayer);
  }

  onChange($event) {
    this.workViewService.onDisplayImageRedraw.emit();
    this.workViewService.saveContent();
  }

  onChangeLineType($event) {
    if (this.currentLayer.type == LayerType.Dot)
      this.currentLayer.interpolationPointDistance = 0
    this.onChange($event);
  }

  isDisableInterpolation() {
    return (this.currentLayer.type == LayerType.Dot)
  }

  onAddLayer($event) {
    console.log(this.authenticationService.currentUserSettingsValue);
    this.currentLayer = CImageUtil.addLayer(this.workViewService.getActiveImage(), this.authenticationService.currentUserSettingsValue.defaultLayerSettings);
    this.onChange($event);
    this.onLayerChange($event);
  }

  onRemoveLayer($event) {
    CImageUtil.removeLayer(this.workViewService.getActiveImage(), this.currentLayer.id);

    if (this.workViewService.getActiveImage().getLayers().length === 0)
      CImageUtil.addLayer(this.workViewService.getActiveImage(), this.authenticationService.currentUserSettingsValue.defaultLayerSettings);

    this.currentLayer = this.workViewService.getActiveImage().getLayers()[0];
    this.onChange($event);
    this.onLayerChange($event);
  }

  onDisplaySettingsChanged($event) {
    this.workViewService.onDisplaySettingsChanged.emit(this.displaySettings);
  }
  onHighlightLine(id: number, highlight: boolean) {
    this.workViewService.highlightLineOfLayer.emit(highlight ? this.currentLayer.lines[id] : null);
  }

  onSelectSubLine($event, id: number) {
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
    return this.workViewService.isLayerClipboardEmpty()
  }

  copyLayersToClipboard($event) {
    this.workViewService.copyLayersToClipboard(this.workViewService.getActiveImage().getLayers());
  }

  copyLayersFromClipboardToImage($event) {
    this.workViewService.copyLayersFromClipboardToImage(this.workViewService.getActiveImage());
    this.onChange(null);
    this.workViewService.restoreLastSelectedLayer()
  }
}

