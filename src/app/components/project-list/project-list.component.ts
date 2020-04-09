import {Component, Input, OnInit} from '@angular/core';
import {Project} from '../../model/project';
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

  projectData: Project[];

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
        this.workViewService.selectDataset(this.selectedDataset)
      }
    });
  }

  private loadData() {
    this.projectData = [];
    this.projectService.getProjects().subscribe((data: Project[]) => {
      this.projectData = data;
    }, error1 => {
      console.log('Fehler beim laden der Project Datein');
    });
  }


  public onSelectDataset(event, dataset) {
    this.selectedDataset = dataset;
    this.workViewService.selectDataset(this.selectedDataset)
  }
}

