import {Component, ElementRef, OnInit} from '@angular/core';
import {CImage} from '../../../model/CImage';
import {ImageService} from '../../../service/image.service';
import {ImageMagicService} from '../../../service/image-magic.service';
import {FilterService} from '../../../service/filter.service';
import {HttpClient} from '@angular/common/http';
import {Dataset} from '../../../model/dataset';
import {DisplayCallback} from '../../../worker/display-callback';

import {WorkViewService} from '../work-view.service';
import {FilterSetService} from '../../../service/filter-set.service';
import {FilterSet} from '../../../model/FilterSet';
import {ICImage} from '../../../model/ICImage';
import {ProcessCallback} from '../../../worker/processCallback';

@Component({
  selector: 'app-filter-control',
  templateUrl: './filter-control.component.html',
  styleUrls: ['./filter-control.component.scss']
})
export class FilterControlComponent implements OnInit, DisplayCallback {

  filterSetList: FilterSet[];

  selectedFilter: FilterSet;

  filterValue: string;

  filterValueChanged = false;

  filterSelected = false;

  private image: ICImage;

  private currentImage: ICImage;

  filterIsRunning = false;

  private doNotResetFilter = false;

  constructor(public imageMagicService: ImageMagicService,
              private imageService: ImageService,
              private filterService: FilterService,
              private http: HttpClient,
              private filterSetService: FilterSetService,
              private workViewService: WorkViewService) {
  }

  ngOnInit() {
    this.loadFilters();
    this.workViewService.changeParentImageOrGroup.subscribe(image => {
      this.image = image;
    });

    this.workViewService.reloadFilterSets.subscribe( _ => {
      this.loadFilters();
    })
  }

  private loadFilters() {
    this.filterSetService.getFilters().subscribe(x => {
      this.filterSetList = x;
      this.filterValueChanged = false;
      this.updateFilterSelected();
    });
  }

  private updateFilterSelected(){
    if (this.filterValue !== '') {
      this.filterSelected = true;
    }
  }

  onChangeFilterSet() {
    this.filterValue = this.selectedFilter.filters;
    this.filterSelected = true;
  }

  onFilterChange() {
    this.filterValueChanged = true;
    if (this.filterValue !== null && this.filterValue !== '') {
      this.filterSelected = true;
    }
  }

  public runFilter() {

    if (this.filterValue === undefined || this.filterValue.length == 0) {
      console.log(this.filterValue + '---');
      return;
    }

    const me = this;

    const dataset = new Dataset();
    dataset.images = [new CImage()];
    dataset.images[0].id = this.image.id;

    this.filterService.runFilterOnDataset(dataset, this.filterValue, {
      displayCallback: this, processCallback : {
        callback(): void {
        }
      } as ProcessCallback
    });
  }

  public resetImage() {
    this.workViewService.changeParentImageOrGroup.emit(this.image)
  }

  public displayCallBack(image: CImage): void {
    this.workViewService.displayImage(image, false);
  }

  public addImage(imgae: CImage): void {
    this.workViewService.filterImageListAdd(imgae);
  }
}
