import {Component, OnInit} from '@angular/core';
import {Vector} from "../../../utils/vaa/model/vector";
import {CImage} from "../../../model/cimage";
import {WorkViewService} from "../work-view.service";

@Component({
  selector: 'app-work-view',
  templateUrl: './work-view.component.html',
  styleUrls: ['./work-view.component.scss']
})
export class WorkViewComponent implements OnInit {

  constructor(private workViewService: WorkViewService) {
  }

  private currentImage: CImage;
  private drawMode = true;
  private mousePositionInCanvas: Vector = new Vector(0, 0);
  private currentZoomLevel = 100;

  ngOnInit() {
    this.workViewService.changeImage.subscribe(image =>
      this.currentImage = image
    );

    this.workViewService.changeImageAndReload.subscribe(image =>
      this.currentImage = image
    );

    this.workViewService.mouseCoordinateOnImage.subscribe(v => {
      this.mousePositionInCanvas = v;
    });
  }

  public resetCanvasZoom() {
    this.workViewService.resetCanvasZoom();
  }

  public changeDrawMode() {
    this.workViewService.drawMode(this.drawMode);
  }
}
