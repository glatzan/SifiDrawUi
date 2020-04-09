import {Component, OnInit} from '@angular/core';
import {DataSaveStatus, WorkViewService} from '../work-view.service';
import {SAImage} from '../../../model/SAImage';
import {MousePosition} from "../../../helpers/mouse-position";
import {CanvasDisplaySettings} from "../../../helpers/canvas-display-settings";
import {MatSnackBar} from "@angular/material/snack-bar";
import {FlickerService} from "../flicker.service";
import {ContrastFilter} from "../../../worker/filter/contrast-filter";
import {SImage} from "../../../model/SImage";
import {MatSliderChange} from "@angular/material/slider";
import {Dataset} from "../../../model/dataset";
import {FilterService} from "../../../service/filter.service";
import {InitializeFilter} from "../../../worker/filter/initialize-filter";
import {Services} from "../../../worker/filter/abstract-filter";
import {ProcessCallback} from "../../../worker/processCallback";
import {DisplayCallback} from "../../../worker/display-callback";
import {JPGToPNGConverterFilter} from "../../../worker/filter/jpgto-pngconverter-filter";
import {DisplayFilter} from "../../../worker/filter/display-filter";
import {ImageService} from "../../../service/image.service";

@Component({
  selector: 'app-work-view',
  templateUrl: './work-view.component.html',
  styleUrls: ['./work-view.component.scss']
})
export class WorkViewComponent implements OnInit {

  constructor(private workViewService: WorkViewService,
              private flickerService: FlickerService,
              private filterService: FilterService,
              private imageService: ImageService,
              private snackBar: MatSnackBar) {
  }

  parentImage: SAImage;

  activeImage: SAImage;

  displaySettings: CanvasDisplaySettings;

  renderComponent = false;

  renderColor = false;

  mousePositionInCanvas = new MousePosition();

  currentZoomLevel = 100;

  contrast: number = 1;

  contentSaveStatus: DataSaveStatus = DataSaveStatus.Saved;

  showFilter: boolean = true;

  ngOnInit() {
    this.displaySettings = this.workViewService.getDisplaySettings();
    this.showFilter = true;

    this.workViewService.onChangedImage.subscribe(change => {
      this.parentImage = change.parent;
      this.activeImage = change.active;
      this.renderComponent = change.active.hasData();
      this.renderColor = false;
      this.contrast = 1;
      this.mousePositionInCanvas.clear();
    });

    this.workViewService.onMouseCoordinatesCanvasChanged.subscribe(v => {
      this.mousePositionInCanvas = v;
      this.renderColor = true;
    });

    this.workViewService.onDataSaveEvent.subscribe(x => {
      this.contentSaveStatus = x.status;
      switch (x.status) {
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
          this.snackBar.open(`Fehler, speichern nicht mögich! (${x.text})`, '', {
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
      if (!this.flickerService.isActive()) {
        this.flickerService.armFlicker(this.displaySettings.flickerTimer);
      } else {
        this.flickerService.stopFlicker(true);
      }
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
      this.workViewService.selectActiveImage(this.activeImage);
    } else {

      const img = Object.assign(new SImage(), this.activeImage);
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
        displayCallBack(image: SImage): void {
          me.workViewService.onChangeDisplayImage.emit(image);
        }, addImage(image: SImage): void {

        }
      } as DisplayCallback);

      const init = new InitializeFilter(services);
      filters.push(init.doFilter());
      const jpgToPNG = new JPGToPNGConverterFilter(services);
      filters.push(jpgToPNG.doFilter(0));
      const contrast = new ContrastFilter(services);
      filters.push(contrast.doFilter(0, {
        targetPos: 0,
        contrast: $event.value,
        maxValue: 255,
        minValue: 0,
        offset: 0,
        rgb: false
      }));
      const display = new DisplayFilter(services);
      filters.push(display.doFilter());

      this.filterService.runFilters(filters, dataset).subscribe(value => {
        console.log('Ende');
      });

    }
  }

  flickerActive() {
    return this.flickerService.isActive();
  }

  toggleFilterView() {
    this.showFilter = !this.showFilter;
    this.workViewService.onRenderImageTools.emit(!this.showFilter);
  }
}
