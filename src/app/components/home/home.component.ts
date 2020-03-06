import {AfterViewInit, Component, OnInit} from '@angular/core';
import {FilterService} from '../../service/filter.service';
import {ImageService} from '../../service/image.service';
import {ImageMagicService} from '../../service/image-magic.service';
import {DatasetService} from '../../service/dataset.service';
import {ImportDialogComponent} from '../import-dialog/import-dialog.component';
import {ExportDialogComponent} from '../export-dialog/export-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {User} from '../../model/user';
import {AuthenticationService} from '../../service/authentication.service';
import {Router} from '@angular/router';
import {FilterSetDialogComponent} from '../filter-set-dialog/filter-set-dialog.component';
import {CreateProjectDialogComponent} from '../create-project-dialog/create-project-dialog.component';
import {WorkViewService} from '../workView/work-view.service';
import {FileUploadDialogComponent} from '../file-upload-dialog/file-upload-dialog.component';
import {FilterSet} from "../../model/FilterSet";

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
              private workViewService: WorkViewService) {
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
  }

  private selectedImageId: string;

  ngOnInit(): void {
    this.workViewService.openFilterDialog.subscribe(x => {
      this.openFilterSetDialog(x)
    });
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

  openFilterSetDialog(filter?: FilterSet): void {
    const dialogRef = this.dialog.open(FilterSetDialogComponent, {
      height: '768px',
      width: '1024px',
      data: {
        filter: filter
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.workViewService.onFilterSetChanged.emit()
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
