import {Component, OnInit} from '@angular/core';
import {Vector} from '../../../utils/vaa/model/vector';
import {WorkViewService} from '../work-view.service';
import {ICImage} from '../../../model/ICImage';

@Component({
  selector: 'app-work-view',
  templateUrl: './work-view.component.html',
  styleUrls: ['./work-view.component.scss']
})
export class WorkViewComponent implements OnInit {

  constructor(private workViewService: WorkViewService) {
  }

  private image: ICImage;
  private activeImage: ICImage;


  private drawMode = true;
  private mousePositionInCanvas: Vector = new Vector(0, 0);
  private currentZoomLevel = 100;

  ngOnInit() {
    this.workViewService.changeDisplayImage.subscribe(image =>
      this.activeImage = image
    );

    this.workViewService.changeParentImageOrGroup.subscribe(image => {
      this.image = image;
      this.activeImage = image;
    });

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
