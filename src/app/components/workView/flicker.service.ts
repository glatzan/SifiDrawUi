import {Injectable} from '@angular/core';
import {WorkViewService} from "./work-view.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {SImage} from "../../model/SImage";

@Injectable({
  providedIn: 'root'
})
export class FlickerService {

  constructor(private workViewService: WorkViewService,
              private snackBar: MatSnackBar) {

    workViewService.onChangedImage.subscribe(change => {
      this.currentImage = change.active;
      this.flickerImageOne = change.active;
      this.stopFlicker();
    });

    workViewService.onAddFlickerImage.subscribe(x => {
      if (x.position === 0) {
        this.flickerImageOne = x.image;
      } else {
        this.flickerImageTwo = x.image;
        if (this.flickerValid()) {
          this.startFilterIfValid = false;
          this.startFlicker();
        }
      }
    });

    this.flickerTime = this.workViewService.getDisplaySettings().flickerTimer
  }

  private flickerTimeout: any = undefined;

  private flickerImageOne: SImage;

  private flickerImageTwo: SImage;

  private currentImage: SImage;

  private active = false;

  private flickerTime = 500;

  private startFilterIfValid = false;

  private imageListNotEmpty: boolean;

  addImage(image: SImage) {
    if (!this.flickerImageOne) {
      this.flickerImageOne = image;
    } else {
      this.flickerImageTwo = image;
    }
  }

  armFlicker(flickerTime: number) {

    if (this.imageListNotEmpty) {
      this.flickerTime = flickerTime;
      this.startFilterIfValid = true;
      this.snackBar.open("Bitte Bild auswählen", '', {
        duration: 1000
      });
    } else {
      this.snackBar.open("Flicker nur mit einer Bildergruppe möglich", '', {
        duration: 1000
      });
    }
  }

  startFlicker(): boolean {
    if (this.flickerValid()) {
      // only start if not flickering
      if (this.flickerTimeout != null)
        return false;

      this.active = true;

      if (this.flickerTime !== 0) {
        this.startFlickerTimeout();
      }

      return true;
    }
    return false;
  }

  updateFlickerTimer(flickerTime: number) {
    if (this.active) {
      this.flickerTime = flickerTime;

      this.startFlicker();
    }
  }

  stopFlicker(resetImage = false) {
    this.active = false;
    this.startFilterIfValid = false;
    this.cancelTimeout();

    this.flickerImageOne = this.currentImage;
    this.flickerImageTwo = null;

    if (resetImage)
      this.workViewService.selectActiveImage(this.currentImage);
  }

  toggleImage() {
    if (this.active && this.flickerTimeout == null) {
      this.flickerSwapImages();
    }
  }

  isActive() {
    return this.active || this.startFilterIfValid;
  }


  setFlickerPossible(flicker: boolean) {
    this.imageListNotEmpty = flicker;
  }

  private cancelTimeout(): void {
    if (this.flickerTimeout) {
      clearTimeout(this.flickerTimeout);
      this.flickerTimeout = undefined;
    }
  }


  private startFlickerTimeout() {
    if (this.flickerTime !== 0 && this.active) {
      this.flickerTimeout = setTimeout(() => {
        if (this.flickerTime !== 0 && this.active) {
          this.flickerSwapImages();
          this.startFlickerTimeout();
        }else {
          this.flickerTimeout = undefined;
        }
      }, this.flickerTime);
    } else {
      this.flickerTimeout = undefined;
    }
  }

  private flickerSwapImages() {
    if (this.currentImage !== this.flickerImageOne) {
      this.workViewService.onChangeDisplayImage.emit(this.flickerImageOne);
      this.currentImage = this.flickerImageOne;
    } else {
      this.workViewService.onChangeDisplayImage.emit(this.flickerImageTwo);
      this.currentImage = this.flickerImageTwo;
    }
  }

  private flickerValid(): boolean {
    return this.flickerImageOne != null && this.flickerImageTwo != null && this.flickerImageOne !== this.flickerImageTwo;
  }

}
