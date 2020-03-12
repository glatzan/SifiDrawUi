import {Injectable} from '@angular/core';
import {ICImage} from "../../model/ICImage";
import {WorkViewService} from "./work-view.service";

@Injectable({
  providedIn: 'root'
})
export class FlickerService {

  constructor(private workViewService: WorkViewService) {
    console.log("Initialize");

    workViewService.onChangedImage.subscribe(change => {
      this.currentImage = change.active;
      this.flickerImageOne = change.active;
      this.stopFlicker();
    });

    workViewService.onAddFlickerImage.subscribe(x => {
      if (this.active) {
        this.addImage(x);
      } else if (this.startFilterIfValid) {
        this.addImage(x);
        if (this.flickerValid()) {
          this.startFilterIfValid = false;
          this.startFlicker();
        }
      }
    });

    this.flickerTime = this.workViewService.getDisplaySettings().flickerTimer
  }

  private flickerTimeout: any = undefined;

  private flickerImageOne: ICImage;

  private flickerImageTwo: ICImage;

  private currentImage: ICImage;

  private active = false;

  private flickerTime = 500;

  private startFilterIfValid = false;

  addImage(image: ICImage) {
    if (!this.flickerImageOne) {
      this.flickerImageOne = image;
    } else {
      this.flickerImageTwo = image;
    }
  }

  armFlicker(flickerTime: number) {
    this.flickerTime = flickerTime;
    this.startFilterIfValid = true;
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

  stopFlicker() {
    this.active = false;
    this.startFilterIfValid = false;
    this.cancelTimeout();

    this.flickerImageOne = this.currentImage;
    this.flickerImageTwo = null;
  }

  toggleImage() {
    if (this.active && this.flickerTimeout == null) {
      this.flickerSwapImages();
    }
  }

  isActive() {
    return this.active || this.startFilterIfValid;
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
      this.workViewService.selectActiveImage(this.flickerImageOne);
    } else {
      this.workViewService.selectActiveImage(this.flickerImageTwo);
    }
  }

  private flickerValid(): boolean {
    return this.flickerImageOne != null && this.flickerImageTwo != null && this.flickerImageOne !== this.flickerImageTwo;
  }

}
