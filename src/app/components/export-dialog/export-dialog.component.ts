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

@Component({
  selector: 'app-export-dialog',
  templateUrl: './export-dialog.component.html',
  styleUrls: ['./export-dialog.component.scss']
})
export class ExportDialogComponent implements OnInit {

  private exportIsRunning: boolean = false;

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

  private complexFilters: string = "";

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

    result.push(`start = f.origImageWorker(img);`);
    startVar = "start";

    if (!this.simpleCopyOrigImage) {
      result.push(`const v1 = f.colorImageWorker(${startVar}, "${this.simpleCustomBackgroundColor}");`);
      startVar = "v1";
    }

    let c = 2;

    for (let layer of this.simpleLayerSettings) {
      if (layer.selected) {
        const newVar = `v${c}`;

        if (this.simpleKeepLayerSettings)
          result.push(`const ${newVar} = f.layerDrawWorker(${startVar})`);
        else
          result.push(`const ${newVar} = f.layerDrawWorker(${startVar},'${layer.layer.id}','${layer.layer.color}',${layer.layer.size});`);

        startVar = newVar;
        c += 1;
      }
    }

    result.push(`const v${c} = f.saveImageWorker(${startVar}, projectDir, datasetDir);`);


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

    if (targetSets.length == 1) {
      console.log("adding")
      while (targetSets.length < this.selectedDatasets.length) {
        targetSets.push(targetSets[0]);
      }
    }

    for (let i of targetSets)
      console.log(i)

    const reqDatasets = []

    for (let d of this.selectedDatasets) {
      reqDatasets.push(this.datasetService.getDataset(d.id))
    }

    this.exportIsRunning = true;
    forkJoin(reqDatasets).subscribe(datasets => {
      console.log("start")
      this.filterService.runWorkers({
        src: datasets,
        target: targetSets
      }, this.complexFilters, {targetProject: this.targetProject.id}, this);
    })


  }

  private async create() {

    // //this.datasetService.
    // const canvas = document.createElement('canvas');
    // const cx = canvas.getContext('2d');
    // this.showProgressDialog = true;
    // this.currentProgress = 0;
    // const c = await this.datasetService.getDataset(this.dataset.id).toPromise();
    // this.todoProgress = c.images.length;
    //
    // const newDatasetID = btoa(`${this.project.id}/${this.name}`);
    //
    // await this.datasetService.createDataset(newDatasetID).toPromise()
    //
    // for (const img of c.images) {
    //   const image = await this.imageService.getImage(img.id).toPromise();
    //   this.currentProgress++;
    //   console.log(image.id);
    //
    //   await DrawUtil.drawCanvas(canvas, image, this.backgroundImage, this.background, this.layerSettings, this.layers.filter(y => y.selected).map(f => f.layer));
    //
    //   const newIMG = new CImage();
    //   newIMG.id = img.id.replace(this.dataset.id, newDatasetID)
    //
    //   const imgData = canvas.toDataURL()
    //   newIMG.data = imgData.substr(imgData.indexOf(',') + 1);
    //   newIMG.name = img.name;
    //
    //   if (this.copyLayers) {
    //     newIMG.layers = image.layers
    //   }
    //
    //   // console.log(newIMG.data)
    //   this.imageService.createImage(newIMG).subscribe(() => {
    //     console.log('saved');
    //   }, error1 => {
    //     console.log('Fehler beim laden der Dataset Datein');
    //     console.error(error1);
    //   });
  }


  // => {
  // this.todoProgress = data.images.length;
  // this.currentProgress = 0;
  //
  //
  // data.images.forEach((x, index) => {
  //   const t = await this.imageService.getImageSynced(x.id);
  //   his.timageService.getImageSynced(x.id).then(image => {
  //     console.log(image.id);
  //     //DrawUtil.drawCanvas(cx, image, this.backgroundImage, this.background, this.layerSettings, this.layers.filter(y => y.selected).map(f => f.layer));
  //     this.currentProgress++;
  //   });
  // });


  public close(): void {
    this.dialogRef.close();
  }
}
