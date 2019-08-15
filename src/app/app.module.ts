import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpClientModule, HttpClient} from '@angular/common/http';

import {AppComponent} from './app.component';
import {DrawCanvasComponent} from './draw-canvas/draw-canvas.component';
import {
  PaginatorModule,
  SpinnerModule,
  DropdownModule,
  ButtonModule,
  ScrollPanelModule,
  ColorPickerModule,
  FieldsetModule, DialogModule, CheckboxModule, InputTextModule, ProgressSpinnerModule
} from 'primeng/primeng';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CaseListComponent} from './case-list/case-list.component';
import {ImageListComponent} from './image-list/image-list.component';
import { ExportDialogComponent } from './export-dialog/export-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    DrawCanvasComponent,
    CaseListComponent,
    ImageListComponent,
    ExportDialogComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    SpinnerModule,
    PaginatorModule,
    ButtonModule,
    ColorPickerModule,
    ScrollPanelModule,
    FieldsetModule,
    DialogModule,
    CheckboxModule,
    InputTextModule,
    ProgressSpinnerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {

}
