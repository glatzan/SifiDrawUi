import {EventEmitter, Injectable, Output} from '@angular/core';
import {CImage} from "../../model/cimage";
import {ImageService} from "../../service/image.service";
import {Vector} from "../../utils/vaa/model/vector";

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
    if (reload)
      this.changeImageAndReload.emit(image)
    else
      this.changeImage.emit(image);
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
}
