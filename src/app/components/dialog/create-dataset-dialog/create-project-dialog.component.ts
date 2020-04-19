import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Project} from "../../../model/project";
import {DatasetService} from "../../../service/dataset.service";

@Component({
  selector: 'app-create-project-dialog',
  templateUrl: './create-project-dialog.component.html',
  styleUrls: ['./create-project-dialog.component.scss']
})
export class CreateDatasetDialogComponent implements OnInit {

  datasetName = 'New Dataset';

  constructor(public dialogRef: MatDialogRef<CreateDatasetDialogComponent>,
              private datasetService: DatasetService,
              @Inject(MAT_DIALOG_DATA) public data: Project) {
  }

  ngOnInit() {
  }

  public create(): void {
    this.datasetService.createDataset(this.datasetName, this.data.id).subscribe(y =>
      this.close()
    );
  }

  public close(): void {
    this.dialogRef.close();
  }
}
