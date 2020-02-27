import {BrowserModule, DomSanitizer, HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';

import {AppComponent} from './app.component';
import {DrawCanvasComponent} from './components/workView/draw-canvas/draw-canvas.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CaseListComponent} from './components/case-list/case-list.component';
import {ImageListComponent} from './components/image-list/image-list.component';
import {ExportDialogComponent} from './components/export-dialog/export-dialog.component';
import {FilterControlComponent} from './components/workView/filter-control/filter-control.component';
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
  MatSnackBarModule,
  MatTabsModule
} from '@angular/material';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ImportDialogComponent} from './components/import-dialog/import-dialog.component';
import {FilterOverlayComponent} from './components/workView/filter-overlay/filter-overlay.component';
import {WorkViewComponent} from './components/workView/work-view/work-view.component';
import {FilterImageListComponent} from './components/workView/filter-image-list/filter-image-list.component';
import {PaintControlComponent} from './components/workView/paint-control/paint-control.component';
import {LoginComponent} from './components/login/login.component';
import {RouterModule} from '@angular/router';
import {routes} from './app.routes';
import {HomeComponent} from './components/home/home.component';
import {AuthInterceptor} from './helpers/AuthInterceptor';
import {ErrorInterceptor} from './helpers/ErrorInterceptor';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSliderModule} from '@angular/material/slider';
import {GestureConfig} from '@angular/material/core';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {FilterSetDialogComponent} from './components/filter-set-dialog/filter-set-dialog.component';
import {CreateProjectDialogComponent} from './components/create-project-dialog/create-project-dialog.component';
import {FileUploadDialogComponent} from './components/file-upload-dialog/file-upload-dialog.component';
import {MaterialFileInputModule} from 'ngx-material-file-input';
import {DragDropModule} from "@angular/cdk/drag-drop";

@NgModule({
  declarations: [
    AppComponent,
    DrawCanvasComponent,
    CaseListComponent,
    ImageListComponent,
    ExportDialogComponent,
    FilterControlComponent,
    ImportDialogComponent,
    FilterOverlayComponent,
    WorkViewComponent,
    FilterImageListComponent,
    PaintControlComponent,
    LoginComponent,
    HomeComponent,
    FilterSetDialogComponent,
    CreateProjectDialogComponent,
    FileUploadDialogComponent,
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
    MatProgressSpinnerModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatMenuModule,
    MatTabsModule,
    MatProgressBarModule,
    ReactiveFormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    MatToolbarModule,
    MatSliderModule,
    MatSlideToggleModule,
    MaterialFileInputModule,
    DragDropModule
  ],
  entryComponents: [ExportDialogComponent, ImportDialogComponent, FilterOverlayComponent, FilterSetDialogComponent, CreateProjectDialogComponent, FileUploadDialogComponent],
  providers: [
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 500}},
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
    {provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig}],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) {
    matIconRegistry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('./assets/mdi.svg'));
  }
}
