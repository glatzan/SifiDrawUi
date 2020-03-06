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


  @Output() onChangedParentImage: EventEmitter<ICImage> = new EventEmitter();

  @Output() onChangedActiveImage: EventEmitter<ICImage> = new EventEmitter();

  @Output() onDisplayImageRedraw: EventEmitter<void> = new EventEmitter();

  @Output() onLayerChange: EventEmitter<Layer> = new EventEmitter();

  @Output() highlightLineOfLayer: EventEmitter<Point[]> = new EventEmitter();

  @Output() onDisplaySettingsChanged: EventEmitter<CanvasDisplaySettings> = new EventEmitter();

  @Output() activateFlicker: EventEmitter<void> = new EventEmitter();

  @Output() onResetCanvasZoom: EventEmitter<void> = new EventEmitter();

  @Output() onMouseCoordinatesCanvasChanged: EventEmitter<MousePosition> = new EventEmitter();

  private image: ICImage;

  private currentImage: ICImage;

  private flickerImage: ICImage;

  private flickerBaseImage: ICImage;

  private flicker = false;

  private lastLayerID: string;

  private displaySettings = new CanvasDisplaySettings();

  private currentSaveTimeout: any = undefined;

  private currentFlickerTimeout: any = undefined;


  constructor(private imageService: ImageService,
              private imageGroupService: ImageGroupService,
              private snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
  }

  public selectImage(image: ICImage) {
    this.flicker = false;
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

  public selectActiveImage(image: ICImage) {
    const img = CImageUtil.prepare(image);
    this.currentImage = img;
    this.forceSave();
    this.onChangedActiveImage.emit(img);
    this.submitLastLayer(img);
  }

  public selectLayer(layer: Layer) {
    this.lastLayerID = layer.id;
    this.onLayerChange.emit(layer);
  }

  private submitLoadedImage(image: ICImage) {
    const img = CImageUtil.prepare(image);
    this.image = img;
    this.currentImage = img;
    this.forceSave();
    this.onChangedParentImage.emit(img);
    this.submitLastLayer(img);
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

  toggleFlicker() {
    this.flicker = !this.flicker;
    if (this.flicker)
      this.startFlicker();
    else
      this.stopFlicker();
  }

  startFlicker() {
    this.flicker = true;
    this.flickerBaseImage = this.currentImage;
    this.flickerImage = this.currentImage;
    this.snackBar.open("Bitte Bild auswählen");

    this.flickerTimeout();
  }

  private flickerTimeout() {
    this.currentFlickerTimeout = setTimeout(() => {
      if (!this.flicker) {
        if (this.currentFlickerTimeout)
          this.cancelFlickerTimeout();
        return;
      } else {
        if (this.currentImage !== this.flickerBaseImage) {
          this.flickerImage = this.currentImage;
          this.selectActiveImage(this.flickerBaseImage);
        } else {
          this.selectActiveImage(this.flickerImage);
        }
      }
      console.log("flicker")
      this.flickerTimeout();
    }, 500);
  }

  stopFlicker() {
    this.cancelFlickerTimeout();
    this.flickerImage = undefined;
    this.selectActiveImage(this.flickerBaseImage);
    this.flickerBaseImage = undefined;
  }

  setFlickerBaseImage(image: ICImage) {
    this.flickerBaseImage = image;
  }


  forceSave() {
    if (this.currentSaveTimeout !== undefined) {
      this.cancelSaveTimeout();
      this.save();

      this.currentSaveTimeout = setTimeout(() => {
        this.save();
      }, 1000);
    }
  }

  saveContent() {
    this.cancelSaveTimeout();
    this.currentSaveTimeout = setTimeout(() => {
      this.save();
    }, 1000);
  }

  private cancelSaveTimeout(): void {
    clearTimeout(this.currentSaveTimeout);
    this.currentSaveTimeout = undefined;
  }

  private cancelFlickerTimeout(): void {
    clearTimeout(this.currentFlickerTimeout);
    this.currentFlickerTimeout = undefined;
  }

  private save() {
    this.imageService.updateICImage(this.image).subscribe(() => {
      console.log('saved');
    }, error1 => {
      console.log('Fehler beim laden der Dataset Datein');
      console.error(error1);
    });
  }

  public getDisplaySettings(): CanvasDisplaySettings {
    return this.displaySettings;
  }

}
