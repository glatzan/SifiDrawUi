import {Component} from '@angular/core';
import {Dataset} from './model/dataset';
import {ImportDialogComponent} from "./components/import-dialog/import-dialog.component";
import {MatDialog} from "@angular/material";
import {ExportDialogComponent} from "./components/export-dialog/export-dialog.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'SifiDrawUi';

  private selectedDatasetId: string;
  private selectedImageId: string;

  constructor(public dialog: MatDialog) {
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

