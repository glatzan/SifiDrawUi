import {Component, Input} from '@angular/core';
import {ImportDialogComponent} from './components/import-dialog/import-dialog.component';
import {MatDialog} from '@angular/material';
import {ExportDialogComponent} from './components/export-dialog/export-dialog.component';
import {FilterService} from './service/filter.service';
import {ImageService} from './service/image.service';
import {ImageMagicService} from './service/image-magic.service';
import {FlaskService} from './service/flask.service';
import {ImageJService} from './service/image-j.service';
import {DrawCanvasComponent} from './components/workView/draw-canvas/draw-canvas.component';
import {DatasetService} from './service/dataset.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'SifiDrawUi';

  private selectedDatasetId: string;
  private selectedImageId: string;

  @Input() drawCanvasComponent: DrawCanvasComponent;

  constructor(public dialog: MatDialog,
              private filterService: FilterService,
              private imageService: ImageService,
              private imageMagicService: ImageMagicService,
              private datasetSerive: DatasetService,
              private falskService: FlaskService,
              private imageJService: ImageJService) {
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
}


