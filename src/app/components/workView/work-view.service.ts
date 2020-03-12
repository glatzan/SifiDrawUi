import {EventEmitter, Injectable, OnInit, Output} from '@angular/core';
import {CImage} from '../../model/CImage';
import {ImageService} from '../../service/image.service';
import CImageUtil from "../../utils/cimage-util";
import {Layer} from "../../model/layer";
import {Point} from "../../model/point";
import {ICImage} from "../../model/ICImage";
import {CImageGroup} from "../../model/CImageGroup";
import {ImageGroupService} from "../../service/image-group.service";
import {Dataset} from "../../model/dataset";
import {FilterSet} from "../../model/FilterSet";
import {MousePosition} from "../../helpers/mouse-position";
import {CanvasDisplaySettings} from "../../helpers/canvas-display-settings";
import {MatSnackBar} from "@angular/material/snack-bar";
import {iif, Observable, of} from "rxjs";
import {flatMap} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class WorkViewService implements OnInit {

  @Output() openFilterDialog: EventEmitter<FilterSet> = new EventEmitter();
  @Output() reloadProjectList: EventEmitter<void> = new EventEmitter();
  @Output() selectDataset: EventEmitter<Dataset> = new EventEmitter();
  @Output() nextSelectImageInDataset: EventEmitter<void> = new EventEmitter();
  @Output() prevSelectImageInDataset: EventEmitter<void> = new EventEmitter();


  @Output() onFilterSetChanged: EventEmitter<void> = new EventEmitter();

  @Output() onAddNewFilteredImage: EventEmitter<ICImage> = new EventEmitter();

  @Output() onKeyPressedOverCanvas: EventEmitter<{ key: string, mousePosition: MousePosition }> = new EventEmitter();

  @Output() onChangedImage: EventEmitter<{ parent: ICImage, active: CImage }> = new EventEmitter();

  @Output() onChangeDisplayImage: EventEmitter<CImage> = new EventEmitter();

  @Output() onAddFlickerImage: EventEmitter<ICImage> = new EventEmitter();

  @Output() onDisplayImageRedraw: EventEmitter<void> = new EventEmitter();

  @Output() onLayerChange: EventEmitter<Layer> = new EventEmitter();

  @Output() highlightLineOfLayer: EventEmitter<Point[]> = new EventEmitter();

  @Output() onDisplaySettingsChanged: EventEmitter<CanvasDisplaySettings> = new EventEmitter();

  @Output() onResetCanvasZoom: EventEmitter<void> = new EventEmitter();

  @Output() onMouseCoordinatesCanvasChanged: EventEmitter<MousePosition> = new EventEmitter();

  @Output() onDataSaveEvent: EventEmitter<DataSaveStatusContainer> = new EventEmitter();

  @Output() onRenderImageTools: EventEmitter<boolean> = new EventEmitter();

  private image: ICImage;

  private activeImage: CImage;

  private displayImage: CImage;

  private lastLayerID: string;

  private displaySettings = new CanvasDisplaySettings();

  private currentSaveTimeout: any = undefined;

  private pngImageBuffer: CImage[] = [];

  constructor(private imageService: ImageService,
              private imageGroupService: ImageGroupService,
              private snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    console.log("Initialize");
  }

  public selectImage(image: ICImage) {
    if (image.id == null) {
      this.submitLoadedImage(image);
    } else {
      if (image instanceof CImageGroup) {
        this.imageGroupService.getImageGroup(image.id, "jpeg").subscribe((group: CImageGroup) => {
          this.submitLoadedImage(group);
        }, message => {
          console.error(message);
        });
      } else {
        this.imageService.getImage(image.id, "jpeg").subscribe((image: CImage) => {
          this.submitLoadedImage(image);
        }, message => {
          console.error(message);
        });
      }
    }
  }

  public selectActiveImage(image: ICImage) {
    this.activeImage = CImageUtil.prepare(image).getImage();
    this.onChangedImage.emit({parent: this.image, active: this.activeImage});
    this.onChangeDisplayImage.emit(this.activeImage);
    this.submitLastLayer(this.activeImage);
  }

  public selectLayer(layer: Layer) {
    this.lastLayerID = layer.id;
    this.onLayerChange.emit(layer);
  }

  public restoreLastSelectedLayer() {
    this.submitLastLayer(this.activeImage);
  }

  private submitLoadedImage(image: ICImage) {
    this.forceSave();
    this.image = CImageUtil.prepare(image);
    this.activeImage = this.image.getImage();
    this.displayImage = this.activeImage;
    this.onChangeDisplayImage.emit(this.activeImage);
    this.onChangedImage.emit({parent: this.image, active: this.activeImage});
    this.submitLastLayer(this.activeImage);
  }

  private submitLastLayer(image: ICImage) {
    if (!image.getLayers()) {
      this.onLayerChange.emit(new Layer('-'))
    } else {
      if (this.lastLayerID) {
        this.onLayerChange.emit(CImageUtil.findLayer(image, this.lastLayerID) || image.getLayers()[0])
      } else {
        this.onLayerChange.emit(image.getLayers()[0]);
      }
    }
  }

  forceSave(callback: () => any = null) {
    if (this.currentSaveTimeout != null) {
      this.cancelSaveTimeout();
      this.save(true, callback);
    } else {
      if (callback)
        callback();
    }
  }

  saveContent(saveImage: boolean = false) {
    this.cancelSaveTimeout();
    this.onDataSaveEvent.emit({image: this.image, status: DataSaveStatus.WaitingForSave});
    this.currentSaveTimeout = setTimeout(() => {
      this.save(saveImage);
      this.currentSaveTimeout = undefined;
    }, 1000);
  }

  getDisplaySettings(): CanvasDisplaySettings {
    return this.displaySettings;
  }

  getActiveImage(): CImage {
    return this.activeImage;
  }


  resetImage() {
    this.selectActiveImage(this.activeImage);
  }

  getPNGFromBuffer(imageID: string): Observable<CImage> {
    return of(imageID).pipe(
      flatMap((data: string) =>
        iif(() => this.findImageFromBuffer(imageID) == null,
          this.imageService.getImage(imageID).pipe(
            flatMap((data: CImage) => new Observable<CImage>((observer) => {
                this.pngImageBuffer.push(data);
                if (this.pngImageBuffer.length > 10) {
                  this.pngImageBuffer.splice(0, 1)
                }
                observer.next(data);
                observer.complete();
              }),
            )
          ),
          of(this.findImageFromBuffer(imageID))
        ))
    );
  }

  private findImageFromBuffer(id: string) {
    for (let img of this.pngImageBuffer) {
      if (img.id === id)
        return img;
    }
    return null;
  }

  private cancelSaveTimeout(): void {
    clearTimeout(this.currentSaveTimeout);
    this.currentSaveTimeout = undefined;
  }

  private save(saveImage: boolean = false, callback: () => any = null) {
    let image = this.image;
    if (saveImage && image)
      image = image.getImage();

    if (image) {
      this.imageService.updateICImage(this.activeImage).subscribe(result => {
        console.log('saved');
        this.onDataSaveEvent.emit({image: result, status: DataSaveStatus.Saved});
        if (callback)
          callback();
      }, error1 => {
        console.log('Fehler beim laden der Dataset Datein');
        if (error1.toString().startsWith("Concurrency Error"))
          this.onDataSaveEvent.emit({image: null, status: DataSaveStatus.FailedConcurrency});
        else
          this.onDataSaveEvent.emit({image: null, status: DataSaveStatus.FailedUnknown, text: error1});
        console.error(error1);

      });
    }
  }
}

export class DataSaveStatusContainer {
  image: ICImage;
  status: DataSaveStatus;
  text?: string
}


export enum DataSaveStatus {
  WaitingForSave,
  Saved,
  FailedConcurrency,
  FailedUnknown
}
