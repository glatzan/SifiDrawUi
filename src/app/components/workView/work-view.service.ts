import {EventEmitter, Injectable, Output} from '@angular/core';
import {CImage} from '../../model/cimage';
import {ImageService} from '../../service/image.service';
import {Vector} from '../../utils/vaa/model/vector';
import CImageUtil from "../../utils/cimage-util";
import {Layer} from "../../model/layer";
import {PointLine} from "../../model/point-line";
import {Point} from "../../model/point";

@Injectable({
  providedIn: 'root'
})
export class WorkViewService {

  @Output() changeImage: EventEmitter<CImage> = new EventEmitter();
  @Output() changeImageAndReload: EventEmitter<CImage> = new EventEmitter();
  @Output() changeFilterList: EventEmitter<Array<CImage>> = new EventEmitter();
  @Output() addImageToFilterList: EventEmitter<CImage> = new EventEmitter();

  @Output() resetImageZoom: EventEmitter<boolean> = new EventEmitter();
  @Output() mouseCoordinateOnImage: EventEmitter<Vector> = new EventEmitter();

  @Output() eraserSizeChange: EventEmitter<number> = new EventEmitter();
  @Output() drawModeChanged: EventEmitter<boolean> = new EventEmitter();
  @Output() pointModeChanged: EventEmitter<boolean> = new EventEmitter();
  @Output() hideLines: EventEmitter<boolean> = new EventEmitter();
  @Output() selectLayer: EventEmitter<Layer> = new EventEmitter();
  @Output() saveAndRedrawImage: EventEmitter<boolean> = new EventEmitter();
  @Output() highlightLine: EventEmitter<Point[]> = new EventEmitter();

  @Output() reloadCaseList: EventEmitter<void> = new EventEmitter();


  constructor(private imageService: ImageService) {
  }

  public displayImageById(imageID: string) {
    this.imageService.getImage(imageID).subscribe((data: CImage) => {
      console.log(`Selecting Image ${imageID}`);
      this.displayImage(data);
    }, message => {
      console.error(`Error: On loading Image ${imageID}`);
      console.error(message);
    });
  }

  public displayImage(image: CImage, reload = true) {
    if (reload) {
      this.changeImageAndReload.emit(CImageUtil.prepareImage(image));
    } else {
      this.changeImage.emit(image);
    }
  }

  public filterImageList(imgs: Array<CImage>) {
    this.changeFilterList.emit(imgs);
  }

  public filterImageListAdd(img: CImage) {
    this.addImageToFilterList.emit(img);
  }

  public mousePositionOnImage(v: Vector) {
    this.mouseCoordinateOnImage.emit(v);
  }

  public resetCanvasZoom() {
    this.resetImageZoom.emit(true);
  }

  public drawMode(enable: boolean) {
    this.drawModeChanged.emit(enable);
  }
}
