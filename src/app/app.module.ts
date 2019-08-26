import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpClientModule, HttpClient} from '@angular/common/http';

import {AppComponent} from './app.component';
import {DrawCanvasComponent} from './components/draw-canvas/draw-canvas.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CaseListComponent} from './components/case-list/case-list.component';
import {ImageListComponent} from './components/image-list/image-list.component';
import { ExportDialogComponent } from './components/export-dialog/export-dialog.component';
import { FilterListComponent } from './components/filter-list/filter-list.component';
import { FilterDialogComponent } from './components/filter-dialog/filter-dialog.component';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {MatDialogModule, MatDividerModule, MatIconModule} from '@angular/material';

@NgModule({
  declarations: [
    AppComponent,
    DrawCanvasComponent,
    CaseListComponent,
    ImageListComponent,
    ExportDialogComponent,
    FilterListComponent,
    FilterDialogComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    ScrollingModule,
    MatDialogModule,
    MatDividerModule,
    MatIconModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {

}
