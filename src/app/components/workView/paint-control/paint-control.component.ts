import {Component, OnInit} from '@angular/core';
import {Layer} from "../../../model/layer";
import {WorkViewService} from "../work-view.service";
import {CImage} from "../../../model/cimage";

@Component({
  selector: 'app-paint-control',
  templateUrl: './paint-control.component.html',
  styleUrls: ['./paint-control.component.scss']
})
export class PaintControlComponent implements OnInit {

  private image: CImage;

  private pointMode = false;

  private hideLines = false;

  private currentLayer: Layer;

  private layers: Layer[];

  private rightClickCircle = 10;

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
    this.layers = image.layers;
    this.currentLayer = image.layers[0];
    this.renderContext = true;
  }

  public onHideLines($event) {

  }

  public onAddLayer($event) {

  }

  public onChangeColor($event) {

  }

  public onHighlightLine(id: number, highlight: boolean) {

  }

  public onSelectLine($event, id: number) {

  }
}
