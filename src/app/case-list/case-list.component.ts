import {Component, OnInit, EventEmitter, Output} from '@angular/core';
import {ProjectData} from "../model/project-data";
import {ProjectService} from "../service/project.service";
import {Subscribable} from "rxjs";

@Component({
  selector: 'app-case-list',
  templateUrl: './case-list.component.html',
  styleUrls: ['./case-list.component.scss']
})
export class CaseListComponent implements OnInit {

  private projectData: ProjectData[];

  @Output() selectProject = new EventEmitter<String>();

  constructor(public projectService: ProjectService) {
    this.loadData();
  }

  private loadData() {
    this.projectData = [];
    this.projectService.getProjects().subscribe((data: ProjectData[]) => {
      this.projectData = data;
    }, error1 => {
      console.log("Fehler beim laden der Project Datein")
    })
  }

  ngOnInit() {
  }

  private onSelect(event, id) {
    this.selectProject.emit(id);
  }

}
