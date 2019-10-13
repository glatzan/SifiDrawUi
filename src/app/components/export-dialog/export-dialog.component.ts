import {Component, Inject, OnInit} from '@angular/core';
import {ProjectData} from '../../model/project-data';
import {ProjectService} from '../../service/project.service';
import {Dataset} from '../../model/dataset';
import {Layer} from '../../model/layer';
import {DatasetService} from '../../service/dataset.service';
import {delay, flatMap} from 'rxjs/operators';
import {ImageService} from '../../service/image.service';
import {CImage} from '../../model/cimage';
import DrawUtil from '../../utils/draw-util';
import {MAT_DIALOG_DATA, MatDialogRef, MatSnackBar} from '@angular/material';
import CImageUtil from "../../utils/cimage-util";
import {FilterService} from "../../service/filter.service";
import {forkJoin} from "rxjs";
import {ProcessCallback} from "../../worker/processCallback";
import {DisplayCallback} from "../../worker/display-callback";

@Component({
  selector: 'app-export-dialog',
  templateUrl: './export-dialog.component.html',
  styleUrls: ['./export-dialog.component.scss']
})
export class ExportDialogComponent implements OnInit, ProcessCallback {

  private projects: ProjectData[];

  private selectedProject: ProjectData;

  private datasets: Dataset[];

  private selectedDatasets: Dataset[];

  private targetProject: ProjectData;

  private targetDataset: string;

  private simpleMode: boolean = true;

  private simpleCopyOrigImage: boolean = false;

  private simpleCustomBackgroundColor: string = "#000000"

  private simpleKeepLayerSettings: boolean = false;

  private simpleLayerSettings: { selected: boolean, layer: Layer }[];

  private simpleCopyLayersToNewImage: boolean = false;

  private simpleFlattenColorSpace: boolean = true;

  private simpleImageSuffix: string = "";

  private complexFilters: string = "";

  exportIsRunning: boolean = false;

  maxRunCount: number = 0;

  percentRun: number = 0;

  completedRunCount: number = 0;

  constructor(public dialogRef: MatDialogRef<ExportDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: string,
              public projectService: ProjectService,
              public datasetService: DatasetService,
              public imageService: ImageService,
              public filterService: FilterService,
              private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    const me = this;
    me.targetDataset = "";
    me.targetProject = null;
    me.simpleLayerSettings = [];
    me.addLayer();

    me.maxRunCount = 0;
    me.percentRun = 0;
    me.exportIsRunning = false;
    me.completedRunCount = 0;

    this.projectService.getProjects().subscribe((data: ProjectData[]) => {
      this.projects = data;

      for (let p of this.projects) {
        if (p.id === this.data) {
          this.selectedProject = p;
          break;
        }
      }

      if (this.selectedProject == null)
        this.selectedProject = this.projects[0]

      me.onSelectProject();

    }, error1 => {
      console.log('Fehler beim laden der Project Datein');
    });

  }

  public onSelectProject() {
    this.datasets = this.selectedProject.datasets
    this.selectedDatasets = [this.datasets[0]] || null;
  }

  public addLayer() {
    this.simpleLayerSettings.push({selected: true, layer: new Layer(String(this.simpleLayerSettings.length + 1))});
    this.generateFilters();
  }

  public removeLayer() {
    if (this.simpleLayerSettings.length > 0)
      this.simpleLayerSettings.pop();

    this.generateFilters();
  }

  public generateFilters() {
    const result = [];
    let startVar = "";

    result.push(`m.load(),`);

    if (!this.simpleCopyOrigImage) {
      result.push(`m.color("${this.simpleCustomBackgroundColor}"),`);
      startVar = "v1";
    }

    for (let layer of this.simpleLayerSettings) {
      if (layer.selected) {
        if (this.simpleKeepLayerSettings)
          result.push(`m.layer('${layer.layer.id}'),`);
        else
          result.push(`m.layer('${layer.layer.id}','${layer.layer.color}',${layer.layer.size}, false),`);
      }
    }

    if (this.simpleFlattenColorSpace) {
      result.push(`m.prepareClasses(),`);
    }

    let targetSetsArr = "[]";

    let addDatasetAsPrefix = false;

    if (this.targetDataset && this.selectedDatasets) {
      const targetSets = this.targetDataset.trim().split(",");

      if (targetSets.length == 1) {
        targetSetsArr = `[{dataset : '*', mapping : '${targetSets[0]}'}]`;
        if (this.selectedDatasets.length > 1)
          addDatasetAsPrefix = true;
      } else {
        if (targetSetsArr.length !== this.selectedDatasets.length) {
          while (targetSets.length < this.selectedDatasets.length) {
            targetSets.push(targetSets[0]);
          }
          addDatasetAsPrefix = true;
        }

        targetSetsArr = "[";
        for (let i = 0; i < targetSets.length; i++) {
          const dataSetID = atob(this.selectedDatasets[i].id);
          targetSetsArr += `{dataset : '${dataSetID.substring(dataSetID.lastIndexOf("/") + 1)}', mapping : '${targetSets[i]}'}`;
        }

        targetSetsArr += "]";
      }
    }

    const targetProject = this.targetProject ? this.targetProject.id : "";

    result.push(`m.save('${targetProject}', ${targetSetsArr}, ${addDatasetAsPrefix}, ${this.simpleCopyLayersToNewImage}, '${this.simpleImageSuffix}')`);

    this.complexFilters = result.join("\r\n");
  }


  public export() {

    if (this.targetProject == null) {
      this.snackBar.open("Keine Ziel Projekt ausgewählt");
      return;
    }

    if (this.selectedDatasets.length == 0) {
      this.snackBar.open("Keine Datasets ausgewählt");
      return;
    }

    const targetSets = this.targetDataset.trim().split(",");

    if (this.selectedDatasets.length != targetSets.length && targetSets.length != 1) {
      this.snackBar.open("Ziel-Datasets nicht richtig definiert, Anzahl = 1 oder Anzahl der ausgewählten Datasets. (Trennung mit ,");
      return;
    }

    const reqDatasets = []

    for (let d of this.selectedDatasets) {
      reqDatasets.push(d.id)
    }

    this.filterService.runFilterOnDatasetID(reqDatasets, this.complexFilters, {
      processCallback: this
    });
  }

  public callback(): void {
    this.percentRun = Math.round(++this.completedRunCount * 100 / this.maxRunCount);
  }

  public close(): void {
    this.dialogRef.close();
  }
}
