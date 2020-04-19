import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ProjectService} from "../../../service/project.service";
import {SEntity} from "../../../model/SEntity";
import {Project} from "../../../model/project";
import {Dataset} from "../../../model/dataset";
import {SImageGroup} from "../../../model/SImageGroup";
import {SImage} from "../../../model/SImage";
import {DatasetService} from "../../../service/dataset.service";
import {ImageGroupService} from "../../../service/image-group.service";
import {ImageService} from "../../../service/image.service";
import {WorkViewService} from "../../workView/work-view.service";

@Component({
  selector: 'app-rename-entity-dialog',
  templateUrl: './rename-entity-dialog.component.html',
  styleUrls: ['./rename-entity-dialog.component.scss']
})
export class RenameEntityDialogComponent implements OnInit {

  entity: SEntity;

  constructor(public dialogRef: MatDialogRef<RenameEntityDialogComponent>,
              private projectService: ProjectService,
              private datasetService: DatasetService,
              private imageGroupService: ImageGroupService,
              private imageService: ImageService,
              private workViewService: WorkViewService,
              @Inject(MAT_DIALOG_DATA) public data: SEntity) {
  }

  ngOnInit(): void {
    this.entity = this.data;
    console.log(this.entity.type)
  }

  rename() {
    if (this.entity.type == "project")
      this.projectService.renameProject(this.entity as Project).subscribe(x => this.workViewService.reloadProjectList.emit());
    else if (this.entity.type == "dataset")
      this.datasetService.renameDataset(this.entity as Dataset).subscribe(x => this.workViewService.reloadProjectList.emit());
    else if (this.entity.type == "group") // TODO: reload current dataset
      this.imageGroupService.renameImageGroup(this.entity as SImageGroup).subscribe(x => this.workViewService.reloadProjectList.emit());
    else if (this.entity.type == "image") // TODO: reload current dataset
      this.imageService.renameImage(this.entity as SImage).subscribe(x => this.workViewService.reloadProjectList.emit());

    this.close();
  }

  public close(): void {
    this.dialogRef.close();
  }

}
