import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {ProjectService} from '../../../service/project.service';

@Component({
  selector: 'app-create-project-dialog',
  templateUrl: './create-project-dialog.component.html',
  styleUrls: ['./create-project-dialog.component.scss']
})
export class CreateProjectDialogComponent implements OnInit {

  projectName = '';

  constructor(public dialogRef: MatDialogRef<CreateProjectDialogComponent>,
              private projectService: ProjectService) {
  }

  ngOnInit() {
  }

  public create(): void {
    this.projectService.createProject(this.projectName).subscribe(y =>
      this.close()
    );
  }

  public close(): void {
    this.dialogRef.close();
  }
}
