import {Component, ElementRef, OnInit} from '@angular/core';
import {CImage} from '../../../model/cimage';
import {ImageService} from '../../../service/image.service';
import {ImageMagicService} from '../../../service/image-magic.service';
import {FilterService} from '../../../service/filter.service';
import {HttpClient} from '@angular/common/http';
import {Dataset} from '../../../model/dataset';
import {DisplayCallback} from '../../../worker/display-callback';

import {OverlayServiceService} from '../../../service/overlay-service.service';
import {WorkViewService} from '../work-view.service';

@Component({
  selector: 'app-filter-control',
  templateUrl: './filter-control.component.html',
  styleUrls: ['./filter-control.component.scss']
})
export class FilterControlComponent implements OnInit, DisplayCallback {

  private image: CImage;

  private filterIsRunning = false;
  private filterValue: string;
  private doNotResetFilter = false;

  constructor(public imageMagicService: ImageMagicService,
              private imageService: ImageService,
              private filterService: FilterService,
              private http: HttpClient,
              private overlayServiceService: OverlayServiceService,
              private workViewService: WorkViewService) {
  }

  ngOnInit() {
    this.reloadDefaultFilter();

    this.workViewService.changeImageAndReload.subscribe(image => {
      this.reloadDefaultFilter();
      this.image = image;
    });
  }

  private reloadDefaultFilter() {
    this.http.get('assets/defaultFilterValue.txt', {responseType: 'text' as 'json'}).subscribe(x => {
      this.filterValue = x.toString();
    });
  }

  public runFilter() {

    if (this.filterValue === undefined || this.filterValue.length == 0) {
      console.log(this.filterValue + '---');
      return;
    }

    const dataset = new Dataset();
    dataset.images = [new CImage()];
    dataset.images[0].id = this.image.id;

    this.filterService.runFilterOnDataset(dataset, this.filterValue, {
      displayCallback: this
    });
  }

  public resetImage() {
    this.workViewService.displayImageById(this.image.id);
  }

  public displayCallBack(image: CImage): void {
    this.workViewService.displayImage(image, false);
  }

  public addImage(imgae: CImage): void {
    this.workViewService.filterImageListAdd(imgae);
  }

  private openFilterOverlay(elemt: ElementRef) {
    this.overlayServiceService.open({}, elemt);
  }
}
