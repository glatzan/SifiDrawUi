import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ImageService} from '../../service/image.service';
import {ProjectData} from '../../model/project-data';
import {Dataset} from '../../model/dataset';
import {ProjectService} from '../../service/project.service';

@Component({
  selector: 'app-file-upload-dialog',
  templateUrl: './file-upload-dialog.component.html',
  styleUrls: ['./file-upload-dialog.component.scss']
})
export class FileUploadDialogComponent implements OnInit {

  private form: FormGroup;

  private projects: ProjectData[];

  private datasets: Dataset[];

  constructor(public dialogRef: MatDialogRef<FileUploadDialogComponent>,
              private formBuilder: FormBuilder,
              public projectService: ProjectService,
              private imageService: ImageService) {
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      files: [],
      selectedProject: null,
      selectedDataset: null,
      overwrite: false
    });

    this.projectService.getProjects().subscribe((data: ProjectData[]) => {
      this.projects = data;
      this.datasets = data[0].datasets || null;

      this.form.controls.selectedProject.setValue(data[0] || null);
      this.form.controls.selectedDataset.setValue(data[0].datasets[0] || null);
    });
  }

  public onSelectProject() {
    this.datasets = this.form.controls.selectedProject.value.datasets;
    this.form.controls.selectedDataset.setValue(this.datasets[0] || null);
  }

  public close(): void {
    this.dialogRef.close();
  }

  public upload() {
    const fileList = this.form.controls.files.value;
    for (const file of fileList._files) {
      this.imageService.uploadImage(file, `${atob(this.form.controls.selectedDataset.value.id)}`, this.form.controls.overwrite.value).subscribe();
    }
    this.close();
  }
}
