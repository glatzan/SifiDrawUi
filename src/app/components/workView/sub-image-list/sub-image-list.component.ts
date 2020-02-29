import {Component, OnInit} from '@angular/core';
import {CImage} from '../../../model/CImage';
import {WorkViewService} from '../work-view.service';
import {CImageGroup} from '../../../model/CImageGroup';

@Component({
  selector: 'app-sub-image-list',
  templateUrl: './sub-image-list.component.html',
  styleUrls: ['./sub-image-list.component.scss']
})
export class SubImageListComponent implements OnInit {

  private imageArray: Array<CImage> = [];

  constructor(private workViewService: WorkViewService) {
  }

  ngOnInit() {
    this.workViewService.changeFilterList.subscribe(imgs => {
      this.imageArray = imgs;
    });

    this.workViewService.changeParentImageOrGroup.subscribe(img => {
      let arr: Array<CImage> = [];

      if (img instanceof CImageGroup) {
        arr = arr.concat(img.images);
      } else {
        arr.push(img);
      }
      this.imageArray = arr;
    });

    this.workViewService.addImageToFilterList.subscribe(img => {
      this.imageArray = [...this.imageArray, img];
    });
  }

  public selectImage(image: CImage) {
    this.workViewService.displayImage(image, false);
  }

}
