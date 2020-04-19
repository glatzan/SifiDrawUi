import {Directive, EventEmitter, Injectable, OnInit, Output} from '@angular/core';
import {SImage} from '../../model/SImage';
import {ImageService} from '../../service/image.service';
import CImageUtil from "../../utils/cimage-util";
import {Layer} from "../../model/layer";
import {Point} from "../../model/point";
import {SAImage} from "../../model/SAImage";
import {SImageGroup} from "../../model/SImageGroup";
import {ImageGroupService} from "../../service/image-group.service";
import {Dataset} from "../../model/dataset";
import {FilterSet} from "../../model/FilterSet";
import {MousePosition} from "../../helpers/mouse-position";
import {CanvasDisplaySettings} from "../../helpers/canvas-display-settings";
import {MatSnackBar} from "@angular/material/snack-bar";
import {iif, Observable, of} from "rxjs";
import {flatMap} from "rxjs/operators";
import {CreateProjectDialogComponent} from "../dialog/create-project-dialog/create-project-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {RenameEntityDialogComponent} from "../dialog/rename-entity-dialog/rename-entity-dialog.component";
import {FilterSetDialogComponent} from "../dialog/filter-set-dialog/filter-set-dialog.component";
import {SEntity} from "../../model/SEntity";
import {DeleteEntityDialogComponent} from "../dialog/delete-entity-dialog/delete-entity-dialog.component";
import {Project} from "../../model/project";
import {CreateDatasetDialogComponent} from "../dialog/create-dataset-dialog/create-project-dialog.component";

@Directive()
@Injectable({
  providedIn: 'root'
})
export class WorkViewService implements OnInit {

  @Output() reloadProjectList: EventEmitter<void> = new EventEmitter();
  @Output() nextSelectImageInDataset: EventEmitter<void> = new EventEmitter();
  @Output() prevSelectImageInDataset: EventEmitter<void> = new EventEmitter();

  @Output() onDatasetChange: EventEmitter<Dataset> = new EventEmitter();

  @Output() onFilterSetChanged: EventEmitter<void> = new EventEmitter();

  @Output() onAddNewFilteredImage: EventEmitter<SAImage> = new EventEmitter();

  @Output() onKeyPressedOverCanvas: EventEmitter<{ key: string, mousePosition: MousePosition }> = new EventEmitter();

  @Output() onChangedImage: EventEmitter<{ parent: SAImage, active: SImage, reset: boolean }> = new EventEmitter();

  @Output() onChangeDisplayImage: EventEmitter<SImage> = new EventEmitter();

  @Output() onAddFlickerImage: EventEmitter<{image: SAImage, position: number}> = new EventEmitter();

  @Output() onDisplayImageRedraw: EventEmitter<void> = new EventEmitter();

  @Output() onLayerChange: EventEmitter<Layer> = new EventEmitter();

  @Output() highlightLineOfLayer: EventEmitter<Point[]> = new EventEmitter();

  @Output() onDisplaySettingsChanged: EventEmitter<CanvasDisplaySettings> = new EventEmitter();

  @Output() onResetCanvasZoom: EventEmitter<void> = new EventEmitter();

  @Output() onMouseCoordinatesCanvasChanged: EventEmitter<MousePosition> = new EventEmitter();

  @Output() onDataSaveEvent: EventEmitter<DataSaveStatusContainer> = new EventEmitter();

  @Output() onRenderImageTools: EventEmitter<boolean> = new EventEmitter();

  private activeDataset: Dataset;

  private image: SAImage;

  private activeImage: SImage;

  private displayImage: SImage;

  private lastLayerID: string;

  private displaySettings = new CanvasDisplaySettings();

  private currentSaveTimeout: any = undefined;

  private pngImageBuffer: SImage[] = [];

  layerClipboard: Layer[];

  constructor(private imageService: ImageService,
              private dialog: MatDialog,
              private imageGroupService: ImageGroupService,
              private snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    console.log("Initialize");
  }

  public selectDataset(dataset: Dataset) {
    this.activeDataset = dataset;
    this.onDatasetChange.emit(dataset)
  }

  public selectImage(image: SAImage) {
    if (image.id == null) {
      this.submitLoadedImage(image);
    } else {
      if (image instanceof SImageGroup) {
        this.imageGroupService.getImageGroup(image.id, false, "jpeg").subscribe((group: SImageGroup) => {
          this.submitLoadedImage(group);
        }, message => {
          console.error(message);
        });
      } else {
        this.imageService.getImage(image.id, "jpeg").subscribe((image: SImage) => {
          this.submitLoadedImage(image);
        }, message => {
          console.error(message);
        });
      }
    }
  }

  public selectActiveImage(image: SAImage, forceReset = false) {
    this.activeImage = CImageUtil.prepare(image).getImage();
    this.onChangedImage.emit({parent: this.image, active: this.activeImage, reset: forceReset});
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

  private submitLoadedImage(image: SAImage) {
    this.forceSave();
    this.image = CImageUtil.prepare(image);
    this.activeImage = this.image.getImage();
    this.displayImage = this.activeImage;
    this.onChangeDisplayImage.emit(this.activeImage);
    this.onChangedImage.emit({parent: this.image, active: this.activeImage, reset: true});
    this.submitLastLayer(this.activeImage);
  }

  private submitLastLayer(image: SAImage) {
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
      this.saveActiveImage(callback);
    } else {
      if (callback)
        callback();
    }
  }

  saveContent(saveImage: boolean = false) {
    this.cancelSaveTimeout();
    this.onDataSaveEvent.emit({image: this.activeImage, status: DataSaveStatus.WaitingForSave});
    this.currentSaveTimeout = setTimeout(() => {
      this.saveActiveImage();
      this.currentSaveTimeout = undefined;
    }, 1000);
  }

  getDisplaySettings(): CanvasDisplaySettings {
    return this.displaySettings;
  }

  getActiveImage(): SImage {
    return this.activeImage;
  }

  getImage() {
    return this.image;
  }

  getDataset() {
    return this.activeDataset;
  }

  resetImage() {
    this.selectActiveImage(this.activeImage, true);
  }

  getPNGFromBuffer(imageID: string): Observable<SImage> {
    return of(imageID).pipe(
      flatMap((data: string) =>
        iif(() => this.findImageFromBuffer(imageID) == null,
          this.imageService.getImage(imageID).pipe(
            flatMap((data: SImage) => new Observable<SImage>((observer) => {
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

  private saveActiveImage(callback: () => any = null) {
    if (this.activeImage) {
      this.saveImage(this.activeImage, callback);
    }
  }

  private saveImage(image: SAImage, callback: () => any = null) {
    this.imageGroupService.update(image).subscribe(result => {
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

   saveNameSpecificImage(image: SAImage, callback: () => any = null) {
    console.log("image change");
    if (image.id === this.image.id) {
      this.image.name = image.name;
      this.saveImage(this.image);
      return;
    } else {
      if (this.image instanceof SImageGroup) {
        for (let subImg of this.image.images) {
          if (subImg.id === image.id) {
            subImg.name = image.name;
            this.saveImage(subImg);
            return;
          }
        }
      }
    }

     if (image.type == "group")
       this.imageGroupService.renameImageGroup(image as SImageGroup);
     else if (image.type == "image") {
       this.imageService.renameImage(image as SImage)
     }
   }

  isLayerClipboardEmpty() {
    return this.layerClipboard != null
  }

  copyLayersToClipboard(layer: Layer[]) {
    this.layerClipboard = layer
  }

  copyLayersFromClipboardToImage(image: SImage) {
    image.layers = this.layerClipboard;
  }

  openCreateProjectDialog(): void {
    const dialogRef = this.dialog.open(CreateProjectDialogComponent, {
      height: '240px',
      width: '320px'
    });

    dialogRef.afterClosed().subscribe(result => {
      this.reloadProjectList.emit();
    });
  }

  openRenameEntityDialog(entity: SEntity): void {
    const dialogRef = this.dialog.open(RenameEntityDialogComponent, {
      height: '240px',
      width: '320px',
      data: entity
    });

    dialogRef.afterClosed().subscribe(result => {
      this.reloadProjectList.emit();
    });
  }

  openFilterSetDialog(filter?: FilterSet): void {
    const dialogRef = this.dialog.open(FilterSetDialogComponent, {
      height: '768px',
      width: '1024px',
      data: filter
    });

    dialogRef.afterClosed().subscribe(result => {
      this.onFilterSetChanged.emit()
    });
  }

  openDeleteEntityDialog(entity: SEntity): void {
    const dialogRef = this.dialog.open(DeleteEntityDialogComponent, {
      height: '240px',
      width: '320px',
      data: entity
    });

    dialogRef.afterClosed().subscribe(result => {
      this.reloadProjectList.emit();
    });
  }

  openCreateDatasetDialog(parent: Project): void {
    const dialogRef = this.dialog.open(CreateDatasetDialogComponent, {
      height: '240px',
      width: '320px',
      data: parent
    });

    dialogRef.afterClosed().subscribe(result => {
      this.reloadProjectList.emit();
    });
  }
}

export class DataSaveStatusContainer {
  image: SAImage;
  status: DataSaveStatus;
  text?: string
}


export enum DataSaveStatus {
  WaitingForSave,
  Saved,
  FailedConcurrency,
  FailedUnknown
}
