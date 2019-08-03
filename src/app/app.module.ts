import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {DrawCanvasComponent} from './draw-canvas/draw-canvas.component';
import {PaginatorModule, SpinnerModule, DropdownModule, ButtonModule, ColorPickerModule} from "primeng/primeng";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

@NgModule({
  declarations: [
    AppComponent,
    DrawCanvasComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SpinnerModule,
    PaginatorModule,
    ButtonModule,
    ColorPickerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
