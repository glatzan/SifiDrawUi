import {Component, OnInit} from '@angular/core';
import {CImage} from "../../../model/cimage";
import {WorkViewService} from "../work-view.service";

@Component({
  selector: 'app-filter-image-list',
  templateUrl: './filter-image-list.component.html',
  styleUrls: ['./filter-image-list.component.scss']
})
export class FilterImageListComponent implements OnInit {

  private imageArray: Array<CImage> = [];

  constructor(private workViewService: WorkViewService) {
  }

  ngOnInit() {
    this.workViewService.changeFilterList.subscribe(imgs => {
      this.imageArray = imgs;
    });

    this.workViewService.changeImageAndReload.subscribe(img => {
      const arr: Array<CImage> = [];
      arr.push(img);
      this.imageArray = arr;
    });

    this.workViewService.addImageToFilterList.subscribe( img =>{
      this.imageArray = [...this.imageArray,img]
    })
  }

  public selectImage(image: CImage) {
    this.workViewService.displayImage(image,false)
  }

}
