import {Component, OnInit, EventEmitter, Output, Input} from '@angular/core';
import {ProjectData} from '../../model/project-data';
import {ProjectService} from '../../service/project.service';
import {Subscribable} from 'rxjs';
import {ExportDialogComponent} from '../export-dialog/export-dialog.component';
import {MatDialog} from '@angular/material';
import {ImageListComponent} from '../image-list/image-list.component';

@Component({
  selector: 'app-case-list',
  templateUrl: './case-list.component.html',
  styleUrls: ['./case-list.component.scss']
})
export class CaseListComponent implements OnInit {

  private projectData: ProjectData[];

  private selectedProjectId: string;

  @Input() imageListComponent: ImageListComponent;

  constructor(public projectService: ProjectService,
              public dialog: MatDialog) {
    this.loadData();
  }

  private loadData() {
    this.projectData = [];
    this.projectService.getProjects().subscribe((data: ProjectData[]) => {
      this.projectData = data;
      console.log('Loading data ' + data.length);
    }, error1 => {
      console.log('Fehler beim laden der Project Datein');
    });
  }

  ngOnInit() {
  }

  private onSelectDataset(event, id) {
    this.selectedProjectId = id;
    this.imageListComponent.onDatasetSelection(id);
  }

  openDialog(id: string): void {
    const dialogRef = this.dialog.open(ExportDialogComponent, {
      height: '500px',
      width: '250px',
      data: {id}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}

