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

}


