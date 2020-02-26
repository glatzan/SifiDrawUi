import {Component, Input, OnInit} from '@angular/core';
import {ProjectData} from '../../model/project-data';
import {ProjectService} from '../../service/project.service';
import {ImageListComponent} from '../image-list/image-list.component';
import {WorkViewService} from "../workView/work-view.service";

@Component({
  selector: 'app-case-list',
  templateUrl: './case-list.component.html',
  styleUrls: ['./case-list.component.scss']
})
export class CaseListComponent implements OnInit {

  private projectData: ProjectData[];

  public selectedProjectId: string;

  @Input() imageListComponent: ImageListComponent;

  constructor(private projectService: ProjectService,
              private workViewService: WorkViewService) {
    this.loadData();
  }

  ngOnInit() {
    this.workViewService.reloadCaseList.subscribe(x => {
      this.loadData();
      if (this.selectedProjectId != null) {
        this.imageListComponent.onDatasetSelection(this.selectedProjectId);
      }
    });
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


  private onSelectDataset(event, id) {
    this.selectedProjectId = id;
    this.imageListComponent.onDatasetSelection(id);
  }
}

