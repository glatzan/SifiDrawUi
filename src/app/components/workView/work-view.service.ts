import {EventEmitter, Injectable, Output} from '@angular/core';
import {CImage} from '../../model/CImage';
import {ImageService} from '../../service/image.service';
import {Vector} from '../../utils/vaa/model/vector';
import CImageUtil from "../../utils/cimage-util";
import {Layer} from "../../model/layer";
import {Point} from "../../model/point";
import {ICImage} from "../../model/ICImage";
import {CImageGroup} from "../../model/CImageGroup";
import {ImageGroupService} from "../../service/image-group.service";
import {Dataset} from "../../model/dataset";

@Injectable({
  providedIn: 'root'
})
export class WorkViewService {

  @Output() changeDisplayImage: EventEmitter<ICImage> = new EventEmitter();
  @Output() changeParentImageOrGroup: EventEmitter<ICImage> = new EventEmitter();
  @Output() changeFilterList: EventEmitter<Array<ICImage>> = new EventEmitter();
  @Output() addImageToFilterList: EventEmitter<ICImage> = new EventEmitter();

  @Output() resetImageZoom: EventEmitter<boolean> = new EventEmitter();
  @Output() mouseCoordinateOnImage: EventEmitter<Vector> = new EventEmitter();

  @Output() eraserSizeChange: EventEmitter<number> = new EventEmitter();
  @Output() drawModeChanged: EventEmitter<boolean> = new EventEmitter();
  @Output() pointModeChanged: EventEmitter<boolean> = new EventEmitter();
  @Output() hideLines: EventEmitter<boolean> = new EventEmitter();
  @Output() selectLayer: EventEmitter<Layer> = new EventEmitter();
  @Output() saveAndRedrawImage: EventEmitter<boolean> = new EventEmitter();
  @Output() highlightLine: EventEmitter<Point[]> = new EventEmitter();

  @Output() reloadProjectList: EventEmitter<void> = new EventEmitter();

  @Output() nextSelectImageInDataset: EventEmitter<void> = new EventEmitter();
  @Output() prevSelectImageInDataset: EventEmitter<void> = new EventEmitter();

  @Output() selectDataset: EventEmitter<Dataset> = new EventEmitter();

  @Output() reloadFilterSets: EventEmitter<void> = new EventEmitter();

  constructor(private imageService: ImageService,
              private imageGroupService: ImageGroupService) {
  }

  public displayImage(image: ICImage, reload = true) {
    if (reload) {
      if (image instanceof CImageGroup) {
        this.imageGroupService.getImageGroup(image.id).subscribe((data: CImageGroup) => {
          console.log(`Selecting ImageGroup ${image.id}`);
          this.changeParentImageOrGroup.emit(CImageUtil.prepareImageGroup(data));
        }, message => {
          console.error(`Error: On loading ImageGroup ${image.id}`);
          console.error(message);
        });
      } else {
        this.imageService.getImage(image.id).subscribe((data: CImage) => {
          console.log(`Selecting Image ${image.id}`);
          this.changeParentImageOrGroup.emit(CImageUtil.prepareImage(data));
        }, message => {
          console.error(`Error: On loading Image ${image.id}`);
          console.error(message);
        });
      }
    } else {
      this.changeDisplayImage.emit(image);
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
