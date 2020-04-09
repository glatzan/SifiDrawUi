import {Component, OnInit} from '@angular/core';
import {SImage} from '../../../model/SImage';
import {WorkViewService} from '../work-view.service';
import {SImageGroup} from '../../../model/SImageGroup';
import {FlickerService} from "../flicker.service";
import CImageUtil from "../../../utils/cimage-util";
import {SAImage} from "../../../model/SAImage";

@Component({
  selector: 'app-sub-image-list',
  templateUrl: './sub-image-list.component.html',
  styleUrls: ['./sub-image-list.component.scss']
})
export class SubImageListComponent implements OnInit {

  imageArray: Array<ImageContainer> = [];

  parentImage: SAImage;

  constructor(private workViewService: WorkViewService,
              private flickerService: FlickerService) {
  }

  ngOnInit() {
    this.workViewService.onChangedImage.subscribe(change => {

      if (this.parentImage !== change.parent || change.reset) {

        this.imageArray = [];

        if (change.parent instanceof SImageGroup) {
          this.imageArray = this.imageArray.concat(change.parent.images.map(x => new ImageContainer(ImageType.Original, x)));
        } else {
          this.imageArray.push(new ImageContainer(ImageType.Original, change.parent));
        }

        this.flickerService.setFlickerPossible(this.imageArray.length > 1);

        this.parentImage = change.parent;
      }
    });

    this.workViewService.onAddNewFilteredImage.subscribe(img => {
      this.imageArray = [...this.imageArray, new ImageContainer(ImageType.Filtered, img)];
      this.flickerService.setFlickerPossible(this.imageArray.length > 1);
    });
  }

  public selectImage(image: ImageContainer) {
    if (this.flickerService.isActive()) {
      this.workViewService.onAddFlickerImage.emit({image: CImageUtil.prepare(image.image), position: 1})
    } else {
      if (image.type === ImageType.Original)
        this.workViewService.selectActiveImage(image.image);
      else {
        this.workViewService.onChangeDisplayImage.emit(image.image);
        this.workViewService.onAddFlickerImage.emit({image: CImageUtil.prepare(image.image), position: 0});
      }
    }
  }
}

class ImageContainer {
  type: ImageType;
  image: SImage;

  constructor(type: ImageType, image: SImage) {
    this.type = type;
    this.image = image;
  }
}

enum ImageType {
  Original,
  Filtered
}
