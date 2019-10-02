import {Component} from '@angular/core';
import {Dataset} from './model/dataset';
import {ImportDialogComponent} from "./components/import-dialog/import-dialog.component";
import {MatDialog} from "@angular/material";
import {ExportDialogComponent} from "./components/export-dialog/export-dialog.component";
import {FilterWorker} from "./worker/filter-worker";
import {FilterService} from "./service/filter.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'SifiDrawUi';

  private selectedDatasetId: string;
  private selectedImageId: string;

  constructor(public dialog: MatDialog, private filterService : FilterService) {
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

  test() {
    const a = this.filterService.origImageWorker("aW1ncy8yMTMyOC8w");
    const b = this.filterService.colorImageWorker(a, "#000000");
    const c = this.filterService.layerDrawWorker(b,"1", "#ffffff",3);
    const d = this.filterService.layerDrawWorker(c,"1", "#aa0800",1);
    const e = this.filterService.saveImageWorker(d,"newProject", "tut");

    a.doWork(null,null).subscribe( y => {
      console.log("End")
    });
  }
}

