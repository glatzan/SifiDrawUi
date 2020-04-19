import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';

import {AppComponent} from './app.component';
import {DrawCanvasComponent} from './components/workView/draw-canvas/draw-canvas.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ProjectListComponent} from './components/project-list/project-list.component';
import {DatasetComponent} from './components/dataset/dataset.component';
import {ExportDialogComponent} from './components/dialog/export-dialog/export-dialog.component';
import {FilterControlComponent} from './components/workView/filter-control/filter-control.component';
import {ScrollingModule} from '@angular/cdk/scrolling';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ImportDialogComponent} from './components/dialog/import-dialog/import-dialog.component';
import {WorkViewComponent} from './components/workView/work-view/work-view.component';
import {SubImageListComponent} from './components/workView/sub-image-list/sub-image-list.component';
import {DrawControlComponent} from './components/workView/draw-control/draw-control.component';
import {LoginComponent} from './components/login/login.component';
import {RouterModule} from '@angular/router';
import {routes} from './app.routes';
import {HomeComponent} from './components/home/home.component';
import {AuthInterceptor} from './helpers/AuthInterceptor';
import {ErrorInterceptor} from './helpers/ErrorInterceptor';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSliderModule} from '@angular/material/slider';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {FilterSetDialogComponent} from './components/dialog/filter-set-dialog/filter-set-dialog.component';
import {CreateProjectDialogComponent} from './components/dialog/create-project-dialog/create-project-dialog.component';
import {FileUploadDialogComponent} from './components/dialog/file-upload-dialog/file-upload-dialog.component';
import {MaterialFileInputModule} from 'ngx-material-file-input';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {EditableComponent} from './components/editable/editable.component';
import {ViewModeDirective} from './components/editable/view-mode-directive';
import {EditModeDirective} from './components/editable/edit-mode-directive';
import {EditableOnEnterDirective} from './components/editable/editable-on-enter-directive';
import {FocusOnShowDirective} from './components/editable/focus-on-show-directive.directive';
import {EnumToArrayPipePipe} from './helpers/enum-to-array-pipe.pipe';
import {WorkViewService} from "./components/workView/work-view.service";
import {LayerPresetDialogComponent} from './components/dialog/layer-preset-dialog/layer-preset-dialog.component';
import {HistoViewComponent} from './components/workView/histo-view/histo-view.component';
import {ClipboardModule} from "@angular/cdk/clipboard";
import { RenameEntityDialogComponent } from './components/dialog/rename-entity-dialog/rename-entity-dialog.component';
import { DeleteEntityDialogComponent } from './components/dialog/delete-entity-dialog/delete-entity-dialog.component';
import {CreateDatasetDialogComponent} from "./components/dialog/create-dataset-dialog/create-project-dialog.component";

@NgModule({
  declarations: [
    AppComponent,
    DrawCanvasComponent,
    ProjectListComponent,
    DatasetComponent,
    ExportDialogComponent,
    FilterControlComponent,
    ImportDialogComponent,
    WorkViewComponent,
    SubImageListComponent,
    DrawControlComponent,
    LoginComponent,
    HomeComponent,
    FilterSetDialogComponent,
    CreateProjectDialogComponent,
    FileUploadDialogComponent,
    EditableComponent,
    ViewModeDirective,
    EditModeDirective,
    EditableOnEnterDirective,
    FocusOnShowDirective,
    EnumToArrayPipePipe,
    LayerPresetDialogComponent,
    HistoViewComponent,
    RenameEntityDialogComponent,
    DeleteEntityDialogComponent,
    CreateDatasetDialogComponent
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
    DragDropModule,
    ClipboardModule
  ],
  entryComponents: [],
  providers: [
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 500}},
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
    WorkViewService],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) {
    matIconRegistry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('./assets/mdi.svg'));
  }
}
