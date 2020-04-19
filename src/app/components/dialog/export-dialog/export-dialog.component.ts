import {Component, Inject, OnInit} from '@angular/core';
import {Project} from '../../../model/project';
import {ProjectService} from '../../../service/project.service';
import {Dataset} from '../../../model/dataset';
import {ImageService} from '../../../service/image.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {FilterService} from "../../../service/filter.service";
import {ProcessCallback} from "../../../worker/processCallback";
import {FilterSet} from "../../../model/FilterSet";
import {FilterSetService} from "../../../service/filter-set.service";
import {SImage} from "../../../model/SImage";

@Component({
  selector: 'app-export-dialog',
  templateUrl: './export-dialog.component.html',
  styleUrls: ['./export-dialog.component.scss']
})
export class ExportDialogComponent implements OnInit, ProcessCallback {

  projects: Project[];

  selectedProject: Project;

  datasets: Dataset[];

  selectedDatasets: Dataset[];

  filterSetList: FilterSet[];

  selectedFilter: FilterSet;

  filterValue: string;

  filterValueChanged = false;

  filterIsRunning = false;

  filterResultData: any;

  filteredDataUpdate = false;

  tabIndex = 0;

  exportIsRunning: boolean = false;

  maxRunCount: number = 0;

  percentRun: number = 0;

  completedRunCount: number = 0;

  constructor(public dialogRef: MatDialogRef<ExportDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: string,
              private projectService: ProjectService,
              private filterService: FilterService,
              private filterSetService: FilterSetService,
              private imageService: ImageService,
              private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    const me = this;
    this.loadFilters();
    me.maxRunCount = 0;
    me.percentRun = 0;
    me.exportIsRunning = false;
    me.completedRunCount = 0;

    this.projectService.getProjects().subscribe((data: Project[]) => {
      this.projects = data;

      for (let p of this.projects) {
        if (p.id === this.data) {
          this.selectedProject = p;
          break;
        }
      }

      if (this.selectedProject == null)
        this.selectedProject = this.projects[0];

      me.onSelectProject();

    }, error1 => {
      console.log('Fehler beim laden der Project Datein');
    });

  }

  private loadFilters() {
    this.filterSetService.getFilters().subscribe(x => {
      this.filterSetList = x;
      this.onFilterValueChange();
    });
  }

  public onSelectProject() {
    this.datasets = this.selectedProject.datasets;
    this.selectedDatasets = [this.datasets[0]] || null;
  }


  onFilterValueChange() {
    if (this.filterValue) {
      this.filterValueChanged = (this.selectedFilter == null || this.selectedFilter.filters != this.filterValue)
    } else {
      this.filterValueChanged = false;
    }
  }

  onChangeFilterSet() {
    this.filterValue = this.selectedFilter.filters;
    this.tabIndex = 0;
    this.onFilterValueChange();
  }

  public export() {
    this.filterService.runFilterOnDatasets(this.selectedDatasets, this.filterValue, {
      processCallback: this, displayCallback: {
        displayCallBack: function (image: SImage) {
        },
        addImage: function (image: SImage) {
        }
      }
    })
  }


  public close(): void {
    this.dialogRef.close();
  }

  callback(): void {
  }

  displayData(data: string): void {
    console.log("")
  }
}
