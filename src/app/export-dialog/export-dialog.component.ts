import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-export-dialog',
  templateUrl: './export-dialog.component.html',
  styleUrls: ['./export-dialog.component.css']
})
export class ExportDialogComponent implements OnInit {

  private showDialog = false;

  constructor() {
  }

  ngOnInit() {
  }

  public showExportDialog(id: string) {
    this.showDialog = true;
  }
}
