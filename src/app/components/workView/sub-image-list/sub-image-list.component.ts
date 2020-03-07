import {Component, OnInit} from '@angular/core';
import {CImage} from '../../../model/CImage';
import {WorkViewService} from '../work-view.service';
import {CImageGroup} from '../../../model/CImageGroup';
import {FlickerService} from "../flicker.service";
import CImageUtil from "../../../utils/cimage-util";

@Component({
  selector: 'app-sub-image-list',
  templateUrl: './sub-image-list.component.html',
  styleUrls: ['./sub-image-list.component.scss']
})
export class SubImageListComponent implements OnInit {

  imageArray: Array<CImage> = [];

  constructor(private workViewService: WorkViewService,
              private flickerService: FlickerService) {
  }

  ngOnInit() {
    this.workViewService.onChangedParentImage.subscribe(img => {
      let arr: Array<CImage> = [];

      if (img instanceof CImageGroup) {
        arr = arr.concat(img.images);
      } else {
        arr.push(img);
      }
      this.imageArray = arr;
    });

    this.workViewService.onAddNewFilteredImage.subscribe(img => {
      this.imageArray = [...this.imageArray, img];
    });
  }

  public selectImage(image: CImage) {
    if (this.flickerService.isActive()) {
      this.workViewService.onAddFlickerImage.emit(CImageUtil.prepare(image))
    } else {
      this.workViewService.selectActiveImage(image);
    }
  }

}
