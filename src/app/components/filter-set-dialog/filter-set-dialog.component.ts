import {AfterViewInit, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FilterSet} from '../../model/FilterSet';
import {FilterSetService} from '../../service/filter-set.service';

@Component({
  selector: 'app-filter-set-dialog',
  templateUrl: './filter-set-dialog.component.html',
  styleUrls: ['./filter-set-dialog.component.scss']
})
export class FilterSetDialogComponent implements OnInit {


  filterSets: FilterSet[];

  selectedFilterSet: FilterSet = new FilterSet();

  contentChanged = false;

  disabled = true;

  constructor(public dialogRef: MatDialogRef<FilterSetDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private filterSetService: FilterSetService) {
  }

  ngOnInit() {
    this.filterSetService.getFilters().subscribe(x => {
      this.filterSets = x;
      if (x.length > 0) {
        this.disabled = false;
        this.selectedFilterSet = x[0];
      }

      if (this.data.filter != null) {
        this.onNewScript(this.data.filter);
      }
    });
  }

  public onChangeFilterSet() {
  }

  public onNewScript(newFilter?: FilterSet) {
    if (newFilter == null) {
      newFilter = new FilterSet();
      newFilter.id = Date.now();
      newFilter.name = 'Neuer Filter';
    }

    this.disabled = false;
    this.filterSetService.createFilterSet(newFilter).subscribe();
    this.filterSets.push(newFilter);
    this.selectedFilterSet = newFilter;
  }

  public onContentChange() {
    this.contentChanged = true;
  }

  public save(): void {
    this.filterSetService.saveFilterSet(this.selectedFilterSet).subscribe(x => {
      this.selectedFilterSet = x;
      this.filterSets.forEach((element, index) => {
        if (element.id === x.id) {
          this.filterSets[index] = x;
        }
      });
    });
    this.contentChanged = false;
  }

  public delete() {
    this.filterSetService.deleteFilterSet(this.selectedFilterSet.id).subscribe(x => {
      this.filterSets = this.filterSets.filter(f => f.id !== this.selectedFilterSet.id);
      if (this.filterSets.length > 0) {
        this.selectedFilterSet = this.filterSets[0];
      } else {
        this.selectedFilterSet = new FilterSet();
        this.disabled = true;
      }
    });
  }

  public close(): void {
    this.dialogRef.close();
  }

}
