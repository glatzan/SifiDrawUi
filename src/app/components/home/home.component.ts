import {Component, Input, OnInit} from '@angular/core';
import {DrawCanvasComponent} from '../workView/draw-canvas/draw-canvas.component';
import {FilterService} from '../../service/filter.service';
import {ImageService} from '../../service/image.service';
import {ImageMagicService} from '../../service/image-magic.service';
import {DatasetService} from '../../service/dataset.service';
import {FlaskService} from '../../service/flask.service';
import {ImageJService} from '../../service/image-j.service';
import {ImportDialogComponent} from '../import-dialog/import-dialog.component';
import {ExportDialogComponent} from '../export-dialog/export-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {User} from "../../model/user";
import {AuthenticationService} from "../../service/authentication.service";
import {Router} from "@angular/router";
import {FilterSetDialogComponent} from "../filter-set-dialog/filter-set-dialog.component";
import {CreateProjectDialogComponent} from "../create-project-dialog/create-project-dialog.component";
import {WorkViewService} from "../workView/work-view.service";
import {FileUploadDialogComponent} from "../file-upload-dialog/file-upload-dialog.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  currentUser: User;

  constructor(private dialog: MatDialog,
              private filterService: FilterService,
              private imageService: ImageService,
              private imageMagicService: ImageMagicService,
              private datasetService: DatasetService,
              private router: Router,
              private authenticationService: AuthenticationService,
              private workViewService : WorkViewService) {
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
  }

  private selectedDatasetId: string;
  private selectedImageId: string;

  @Input() drawCanvasComponent: DrawCanvasComponent;

  ngOnInit(): void {
  }

  onDatasetSelect(id: string) {
    console.log(id);
    this.selectedDatasetId = id;
  }

  onImageSelect(id: string) {
    console.log(`Select Image ${id}`);
    this.selectedImageId = id;
  }

  openImportDialog(): void {
    const dialogRef = this.dialog.open(ImportDialogComponent, {
      height: '768px',
      width: '1024px',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }


  openExportDialog(id?: string): void {
    const dialogRef = this.dialog.open(ExportDialogComponent, {
      height: '768px',
      width: '1024px',
      data: {id}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  openFilterSetDialog(): void {
    const dialogRef = this.dialog.open(FilterSetDialogComponent, {
      height: '768px',
      width: '1024px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  openCreateProjectDialog(): void {
    const dialogRef = this.dialog.open(CreateProjectDialogComponent, {
      height: '240px',
      width: '320px'
    });

    dialogRef.afterClosed().subscribe(result => {
      this.workViewService.reloadProjectList.emit();
    });
  }

  openFileUploadDialog(): void {
    const dialogRef = this.dialog.open(FileUploadDialogComponent, {
      height: '360px',
      width: '480px'
    });

    dialogRef.afterClosed().subscribe(result => {
      this.workViewService.reloadProjectList.emit();
    });
  }


  logout() {
    this.authenticationService.logout();
    this.router.navigate(['/login']);
  }
}
