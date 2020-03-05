import {Component, OnInit} from '@angular/core';
import {WorkViewService} from '../work-view.service';
import {ICImage} from '../../../model/ICImage';
import {MousePosition} from "../../../helpers/mouse-position";

@Component({
  selector: 'app-work-view',
  templateUrl: './work-view.component.html',
  styleUrls: ['./work-view.component.scss']
})
export class WorkViewComponent implements OnInit {

  constructor(private workViewService: WorkViewService) {
  }

  image: ICImage;
  activeImage: ICImage;

  drawMode = true;
  mousePositionInCanvas = new MousePosition();
  currentZoomLevel = 100;
  renderColor = false;

  ngOnInit() {
    this.workViewService.changeDisplayImage.subscribe(image => {
      this.activeImage = image;
      this.renderColor = false;
      this.mousePositionInCanvas.clear();
    });

    this.workViewService.changeParentImageOrGroup.subscribe(image => {
      this.image = image;
      this.activeImage = image;
      this.renderColor = false;
      this.mousePositionInCanvas.clear();
    });

    this.workViewService.mouseCoordinateOnImage.subscribe(v => {
      this.mousePositionInCanvas = v;
      this.renderColor = true;
    });
  }

  public resetCanvasZoom() {
    this.workViewService.resetCanvasZoom();
  }

  public changeDrawMode() {
    this.workViewService.drawMode(this.drawMode);
  }
}
