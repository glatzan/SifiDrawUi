import {Component, OnInit} from '@angular/core';
import {DataSaveStatus, WorkViewService} from '../work-view.service';
import {ICImage} from '../../../model/ICImage';
import {MousePosition} from "../../../helpers/mouse-position";
import {CanvasDisplaySettings} from "../../../helpers/canvas-display-settings";
import {CImageGroup} from "../../../model/CImageGroup";
import {MatSnackBar} from "@angular/material/snack-bar";
import {FlickerService} from "../flicker.service";
import {ContrastFilter} from "../../../worker/filter/contrast-filter";
import {CImage} from "../../../model/CImage";
import {MatSliderChange} from "@angular/material/slider";
import {Dataset} from "../../../model/dataset";
import {FilterService} from "../../../service/filter.service";
import {InitializeFilter} from "../../../worker/filter/initialize-filter";
import {Services} from "../../../worker/filter/abstract-filter";
import {ProcessCallback} from "../../../worker/processCallback";
import {DisplayCallback} from "../../../worker/display-callback";
import {JPGToPNGConverterFilter} from "../../../worker/filter/jpgto-pngconverter-filter";
import {DisplayFilter} from "../../../worker/filter/display-filter";

@Component({
  selector: 'app-work-view',
  templateUrl: './work-view.component.html',
  styleUrls: ['./work-view.component.scss']
})
export class WorkViewComponent implements OnInit {

  constructor(private workViewService: WorkViewService,
              private flickerService: FlickerService,
              private filterService: FilterService,
              private snackBar: MatSnackBar) {
  }

  displaySettings: CanvasDisplaySettings;

  renderComponent = false;

  renderColor = false;

  mousePositionInCanvas = new MousePosition();

  currentZoomLevel = 100;

  parentImage: ICImage;

  activeImage: ICImage;

  contrastCopy: ICImage;

  contrast: number = 1;

  contentSaveStatus: DataSaveStatus = DataSaveStatus.Saved;

  ngOnInit() {
    this.displaySettings = this.workViewService.getDisplaySettings();

    this.workViewService.onChangedParentImage.subscribe(image => {
      this.parentImage = image;
      this.activeImage = image;
      this.contrastCopy = image;
      this.renderComponent = image.hasData();
      this.renderColor = false;
      this.contrast = 1;
      this.mousePositionInCanvas.clear();
    });

    this.workViewService.onChangedActiveImage.subscribe(image => {
      this.activeImage = image;
      this.renderComponent = image.hasData();

      if (this.activeImage.id !== "contrast") {
        this.contrastCopy = image;
        this.contrast = 1;
      }

    });

    this.workViewService.onMouseCoordinatesCanvasChanged.subscribe(v => {
      this.mousePositionInCanvas = v;
      this.renderColor = true;
    });

    this.workViewService.onDataSaveEvent.subscribe(x => {
      this.contentSaveStatus = x;
      switch (x) {
        case DataSaveStatus.WaitingForSave:
          break;
        case DataSaveStatus.Saved:
          break;
        case DataSaveStatus.FailedConcurrency:
          this.snackBar.open("Versionsfehler, Speicher nicht mögich!", '', {
            duration: 2000
          });
          break;
        case DataSaveStatus.FailedUnknown:
          this.snackBar.open("Unbekannter Fehler, Speicher nicht mögich!", '', {
            duration: 2000
          });
          break;
      }
    })
  }

  public resetCanvasZoom() {
    this.workViewService.onResetCanvasZoom.emit();
  }

  public flicker() {
    if (this.parentImage instanceof CImageGroup) {
      if (!this.flickerService.isActive()) {
        this.flickerService.addImage(this.activeImage);
        this.flickerService.armFlicker(this.displaySettings.flickerTimer);
        this.snackBar.open("Bitte Bild auswählen", '', {
          duration: 1000
        });
      } else {
        this.flickerService.stopFlicker();
      }
    } else
      this.snackBar.open("Flicker nur mit einer Bildergruppe möglich", '', {
        duration: 1000
      });
  }

  public onFlickerChange($event) {
    if (this.flickerService.isActive()) {
      if ($event === 0) {
        this.snackBar.open("Toggel per Tase T", '', {
          duration: 3000
        });
      }
      this.flickerService.updateFlickerTimer($event);
    }
  }

  public changeDrawMode() {
    this.workViewService.onDisplaySettingsChanged.emit();
  }

  onContrastChange($event: MatSliderChange) {
    console.log($event.value);
    if ($event.value === 1) {
      this.workViewService.onChangedActiveImage.emit(this.contrastCopy);
    } else {

      const img = Object.assign(new CImage(), this.contrastCopy)
      img.id = "contrast";
      const dataset = new Dataset();
      dataset.images = [img];

      const filters = [];
      const me = this;
      const services = new Services({
        callback(): void {
        },
        displayData(data: string): void {
        }
      } as ProcessCallback, {
        displayCallBack(image: CImage): void {
          me.workViewService.onChangedActiveImage.emit(image);
        }, addImage(image: CImage): void {

        }
      } as DisplayCallback);

      const init = new InitializeFilter(services);
      filters.push(init.doFilter());
      const jpgToPNG = new JPGToPNGConverterFilter(services);
      filters.push(jpgToPNG.doFilter(0));
      const contrast = new ContrastFilter(services);
      filters.push(contrast.doFilter(0, {targetPos: 0, contrast: $event.value}));
      const display = new DisplayFilter(services);
      filters.push(display.doFilter());

      this.filterService.runFilters(filters, dataset).subscribe(value => {
        console.log('Ende');
      });

      // const target = FilterHelper.createNewImage(this.activeImage.getWidth(), this.activeImage.getHeight(), "#000", "contrast");
      // const contrastFilter = new ContrastFilter(null);
      // const img = contrastFilter.doFilter(this.contrastCopy as CImage, target, $event.value);

    }
  }

  flickerActive() {
    return this.flickerService.isActive();
  }
}
