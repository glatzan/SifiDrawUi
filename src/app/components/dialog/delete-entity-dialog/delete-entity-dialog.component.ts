import {Component, Inject, OnInit} from '@angular/core';
import {SEntity} from "../../../model/SEntity";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ProjectService} from "../../../service/project.service";
import {DatasetService} from "../../../service/dataset.service";
import {ImageGroupService} from "../../../service/image-group.service";
import {ImageService} from "../../../service/image.service";
import {WorkViewService} from "../../workView/work-view.service";
import {Project} from "../../../model/project";
import {Dataset} from "../../../model/dataset";
import {SImageGroup} from "../../../model/SImageGroup";
import {SImage} from "../../../model/SImage";

@Component({
  selector: 'app-delete-entity-dialog',
  templateUrl: './delete-entity-dialog.component.html',
  styleUrls: ['./delete-entity-dialog.component.scss']
})
export class DeleteEntityDialogComponent implements OnInit {

  entity: SEntity;

  constructor(public dialogRef: MatDialogRef<DeleteEntityDialogComponent>,
              private projectService: ProjectService,
              private datasetService: DatasetService,
              private imageGroupService: ImageGroupService,
              private imageService: ImageService,
              private workViewService: WorkViewService,
              @Inject(MAT_DIALOG_DATA) public data: SEntity) {
  }

  ngOnInit(): void {
    this.entity = this.data
  }

  delete() {
    if (this.entity.type == "project")
      this.projectService.deleteProject(this.entity as Project).subscribe(x => this.workViewService.reloadProjectList.emit());
    else if (this.entity.type == "dataset")
      this.datasetService.deleteDataset(this.entity as Dataset).subscribe(x => this.workViewService.reloadProjectList.emit());
    else if (this.entity.type == "group") // TODO: reload current dataset
      this.imageGroupService.delete(this.entity as SImageGroup).subscribe(x => this.workViewService.reloadProjectList.emit());
    else if (this.entity.type == "image") // TODO: reload current dataset
      this.imageService.deleteImage(this.entity as SImage).subscribe(x => this.workViewService.reloadProjectList.emit());

    this.close();
  }

  public close(): void {
    this.dialogRef.close();
  }

}
