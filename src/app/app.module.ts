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
import {ScrollingModule} from '@angular/cdk/scrolling';
import {
  MAT_SNACK_BAR_DEFAULT_OPTIONS,
  MatButtonModule,
  MatButtonToggleModule,
  MatCheckboxModule,
  MatDialogModule,
  MatDividerModule,
  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatIconRegistry,
  MatInputModule,
  MatMenuModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatTabsModule
} from '@angular/material';
import {FormsModule} from "@angular/forms";
import {MatColorPickerModule} from "mat-color-picker";
import {MccColorPickerModule} from "material-community-components";
import { ImportDialogComponent } from './components/import-dialog/import-dialog.component';
import {MatSnackBarModule} from '@angular/material';

@NgModule({
  declarations: [
    AppComponent,
    DrawCanvasComponent,
    CaseListComponent,
    ImageListComponent,
    ExportDialogComponent,
    FilterListComponent,
    ImportDialogComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    ScrollingModule,
    MatDialogModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    MatColorPickerModule,
    MccColorPickerModule,
    MatProgressSpinnerModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatMenuModule,
    MatTabsModule,
    MatProgressBarModule
  ],
  entryComponents: [ExportDialogComponent, ImportDialogComponent],
  providers: [{provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 500}}],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) {
    matIconRegistry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('./assets/mdi.svg'));
  }
}
