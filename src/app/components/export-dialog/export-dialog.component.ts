import {Component, Inject, OnInit} from '@angular/core';
import {ProjectData} from '../../model/project-data';
import {ProjectService} from '../../service/project.service';
import {Dataset} from '../../model/dataset';
import {Layer} from '../../model/layer';
import {DatasetService} from '../../service/dataset.service';
import {delay} from 'rxjs/operators';
import {ImageService} from '../../service/image.service';
import {CImage} from '../../model/cimage';
import DrawUtil from '../../utils/draw-util';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-export-dialog',
  templateUrl: './export-dialog.component.html',
  styleUrls: ['./export-dialog.component.scss']
})
export class ExportDialogComponent implements OnInit {

  private showDialog = false;

  private projects: ProjectData[];

  private datasets: Dataset[];

  private project: ProjectData;

  private dataset: Dataset;

  private name: string;

  private background: string;

  private backgroundImage: boolean;

  private layerSettings: boolean;

  private copyLayers: boolean;

  private layers: { selected: boolean, layer: Layer }[];

  private showProgressDialog: boolean;

  private currentProgress = 0;

  private todoProgress = 0;

  constructor(public dialogRef: MatDialogRef<ExportDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: string,
              public projectService: ProjectService,
              public datasetService: DatasetService,
              public imageService: ImageService) {
  }

  ngOnInit() {
  }

  public showExportDialog(id: string) {
    this.showDialog = true;
    this.name = '';
    this.background = '#000000';
    this.backgroundImage = false;
    this.layers = [];
    this.layers.push({selected: false, layer: new Layer(1)});
    this.projects = [];
    this.layerSettings = false;
    this.showProgressDialog = false;
    this.currentProgress = 0;
    this.todoProgress = 0;
    this.projectService.getProjects().subscribe((data: ProjectData[]) => {
      this.projects = data;
      this.projects.forEach(x => {
          console.log(x.id + ' ' + id);
          if (x.id === id) {
            this.project = x;
            this.datasets = x.datasets;

            if (this.datasets.length > 0) {
              this.dataset = this.datasets[0];
            }
          }
        }
      );
    }, error1 => {
      console.log('Fehler beim laden der Project Datein');
    });
  }

  private addLayer() {
    this.layers.push({selected: false, layer: new Layer(this.layers.length + 1)});
  }

  private abort() {
    this.showDialog = false;
  }

  private async create() {

    //this.datasetService.
    const canvas = document.createElement('canvas');
    const cx = canvas.getContext('2d');
    canvas.toDataURL()
    this.showProgressDialog = true;
    this.currentProgress = 0;
    const c = await this.datasetService.getDataset(this.dataset.id).toPromise();
    this.todoProgress = c.images.length;

    const newDatasetID = `${this.project.id}_|_${this.name}`

    await this.datasetService.createDataset(newDatasetID).toPromise()

    for (const img of c.images) {
      const image = await this.imageService.getImage(img.id).toPromise();
      this.currentProgress++;
      console.log(image.id);

      await DrawUtil.drawCanvas(canvas, image, this.backgroundImage, this.background, this.layerSettings, this.layers.filter(y => y.selected).map(f => f.layer));

      const newIMG = new CImage();
      newIMG.id = img.id.replace(this.dataset.id, newDatasetID)

      const imgData = canvas.toDataURL()
      newIMG.data = imgData.substr(imgData.indexOf(',')+1);
      newIMG.name = img.name;

      if(this.copyLayers){
        newIMG.layers = image.layers
      }

      // console.log(newIMG.data)
      this.imageService.createImage(newIMG).subscribe(() => {
        console.log('saved');
      }, error1 => {
        console.log('Fehler beim laden der Dataset Datein');
        console.error(error1);
      });
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


  }

  closeDialog() {
    this.dialogRef.close('');
  }
}
