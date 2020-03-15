import {Component, OnInit} from '@angular/core';
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
import {DomSanitizer} from "@angular/platform-browser";

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

  filterIsRunning = false;

  filterResultData: any;

  filteredDataUpdate = false;

  tabIndex = 0;

  private image: ICImage;

  constructor(public imageMagicService: ImageMagicService,
              private imageService: ImageService,
              private filterService: FilterService,
              private http: HttpClient,
              private filterSetService: FilterSetService,
              private workViewService: WorkViewService,
              private sanitized: DomSanitizer) {
  }

  ngOnInit() {
    this.loadFilters();
    this.workViewService.onChangedImage.subscribe(image => {
      this.image = image.parent;
    });

    this.workViewService.onFilterSetChanged.subscribe(_ => {
      this.loadFilters();
    })
  }

  private loadFilters() {
    this.filterSetService.getFilters().subscribe(x => {
      this.filterSetList = x;
      this.onFilterValueChange();
    });
  }

  isNewFilter(): boolean {
    return this.selectedFilter == null;
  }

  isFilterSelected() {
    return this.filterValue;
  }


  onChangeFilterSet() {
    this.filterValue = this.selectedFilter.filters;
    this.tabIndex = 0;
    this.onFilterValueChange();
  }


  onFilterValueChange() {
    if (this.filterValue) {
      this.filterValueChanged = (this.selectedFilter == null || this.selectedFilter.filters != this.filterValue)
    } else {
      this.filterValueChanged = false;
    }
  }

  onSaveFilter() {
    if (this.selectedFilter != null) {
      this.selectedFilter.filters = this.filterValue;
      this.filterSetService.saveFilterSet(this.selectedFilter).subscribe(x => {
        this.onFilterValueChange();
      });
    } else {
      let newFilter = new FilterSet();
      newFilter.id = Date.now();
      newFilter.name = 'Neuer Filter';
      newFilter.filters = this.filterValue;
      this.workViewService.openFilterDialog.emit(newFilter);
    }
  }

  public runFilter() {

    if (!this.filterValue || this.filterValue.length == 0) {
      console.log(this.filterValue + '---');
      return;
    }

    const me = this;

    const dataset = new Dataset();
    dataset.images = [this.image];

    this.filterService.runFilterOnDataset(dataset, this.filterValue, {
      displayCallback: this, processCallback: {
        callback(): void {
        },
        displayData(data: string): void {
          me.filterResultData = me.sanitized.bypassSecurityTrustHtml(data);
          me.filteredDataUpdate = true;
          me.tabIndex = 1;
        }
      } as ProcessCallback
    });
  }

  public resetImage() {
    this.workViewService.resetImage();
  }

  public displayCallBack(image: CImage): void {
    this.workViewService.onChangeDisplayImage.emit(image);
  }

  public addImage(image: CImage): void {
    this.workViewService.onAddNewFilteredImage.emit(image);
  }
}
