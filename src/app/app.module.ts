import {BrowserModule, DomSanitizer} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpClientModule, HttpClient} from '@angular/common/http';

import {AppComponent} from './app.component';
import {DrawCanvasComponent} from './components/draw-canvas/draw-canvas.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CaseListComponent} from './components/case-list/case-list.component';
import {ImageListComponent} from './components/image-list/image-list.component';
import {ExportDialogComponent} from './components/export-dialog/export-dialog.component';
import {FilterListComponent} from './components/filter-list/filter-list.component';
import {FilterDialogComponent} from './components/filter-dialog/filter-dialog.component';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {MatButtonModule, MatDialogModule, MatDividerModule, MatIconModule, MatIconRegistry} from '@angular/material';

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
    MatIconModule,
    MatButtonModule
  ],
  entryComponents: [ExportDialogComponent],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) {
    matIconRegistry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('./assets/mdi.svg'));
  }
}
