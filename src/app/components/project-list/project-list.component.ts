import {Component, Input, OnInit} from '@angular/core';
import {ProjectData} from '../../model/project-data';
import {ProjectService} from '../../service/project.service';
import {DatasetComponent} from '../dataset/dataset.component';
import {WorkViewService} from "../workView/work-view.service";
import {Dataset} from "../../model/dataset";

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit {

  projectData: ProjectData[];

  selectedDataset: Dataset;

  @Input() imageListComponent: DatasetComponent;

  constructor(private projectService: ProjectService,
              private workViewService: WorkViewService) {
    this.loadData();
  }

  ngOnInit() {
    this.workViewService.reloadProjectList.subscribe(x => {
      this.loadData();
      if (this.selectedDataset != null) {
        this.workViewService.selectDataset.emit(this.selectedDataset);
      }
    });
  }

  private loadData() {
    this.projectData = [];
    this.projectService.getProjects().subscribe((data: ProjectData[]) => {
      this.projectData = data;
    }, error1 => {
      console.log('Fehler beim laden der Project Datein');
    });
  }


  public onSelectDataset(event, dataset) {
    this.selectedDataset = dataset;
    this.workViewService.selectDataset.emit(dataset);
  }
}

