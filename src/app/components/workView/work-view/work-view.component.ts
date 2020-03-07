import {Component, OnInit} from '@angular/core';
import {WorkViewService} from '../work-view.service';
import {ICImage} from '../../../model/ICImage';
import {MousePosition} from "../../../helpers/mouse-position";
import {CanvasDisplaySettings} from "../../../helpers/canvas-display-settings";
import {CImageGroup} from "../../../model/CImageGroup";
import {MatSnackBar} from "@angular/material/snack-bar";
import {FlickerService} from "../flicker.service";

@Component({
  selector: 'app-work-view',
  templateUrl: './work-view.component.html',
  styleUrls: ['./work-view.component.scss']
})
export class WorkViewComponent implements OnInit {

  constructor(private workViewService: WorkViewService,
              private flickerService: FlickerService,
              private snackBar: MatSnackBar) {
  }

  displaySettings: CanvasDisplaySettings;

  renderComponent = false;

  renderColor = false;

  mousePositionInCanvas = new MousePosition();

  currentZoomLevel = 100;

  parentImage: ICImage;

  activeImage: ICImage;

  ngOnInit() {
    this.displaySettings = this.workViewService.getDisplaySettings();

    this.workViewService.onChangedParentImage.subscribe(image => {
      this.parentImage = image;
      this.activeImage = image;
      this.renderComponent = image.hasData();
      this.renderColor = false;
      this.mousePositionInCanvas.clear();
    });

    this.workViewService.onChangedActiveImage.subscribe(image => {
      this.activeImage = image;
      this.renderComponent = image.hasData();
    });

    this.workViewService.onMouseCoordinatesCanvasChanged.subscribe(v => {
      this.mousePositionInCanvas = v;
      this.renderColor = true;
    });
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

  flickerActive(){
    return this.flickerService.isActive();
  }
}
