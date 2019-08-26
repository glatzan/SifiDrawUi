import {Component, OnInit} from '@angular/core';
import {Filter} from '../../model/filter/filter';
import {FilterService} from '../../service/filter.service';

@Component({
  selector: 'app-filter-dialog',
  templateUrl: './filter-dialog.component.html',
  styleUrls: ['./filter-dialog.component.scss']
})
export class FilterDialogComponent implements OnInit {

  private showDialog = false;

  private filterArr: Filter[];

  private allFilters: Filter[];

  constructor(private filterService: FilterService) {
  }

  ngOnInit() {
  }

  public showFilterDialog(filterArr: Filter[]) {
    this.filterArr = filterArr;
    this.allFilters = this.filterService.getAllFilters();
  }

}
