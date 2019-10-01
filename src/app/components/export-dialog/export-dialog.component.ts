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
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import CImageUtil from "../../utils/cimage-util";

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
              public imageService: ImageService) {
  }

  ngOnInit() {
    const me = this;
    me.targetDataset = "";
    me.targetProject = null;
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
    this.simpleLayerSettings.push({selected: true, layer: new Layer("" + this.simpleLayerSettings.length + 1)})
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
