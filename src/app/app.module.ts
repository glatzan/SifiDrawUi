import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpClientModule, HttpClient} from "@angular/common/http";

import {AppComponent} from './app.component';
import {DrawCanvasComponent} from './draw-canvas/draw-canvas.component';
import {PaginatorModule, SpinnerModule, DropdownModule, ButtonModule, ScrollPanelModule, ColorPickerModule} from "primeng/primeng";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import { CaseListComponent } from './case-list/case-list.component';
import { ImageListComponent } from './image-list/image-list.component';

@NgModule({
  declarations: [
    AppComponent,
    DrawCanvasComponent,
    CaseListComponent,
    ImageListComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    SpinnerModule,
    PaginatorModule,
    ButtonModule,
    ColorPickerModule,
    ScrollPanelModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {

}
