import {Component, OnInit, EventEmitter, Input, Output} from '@angular/core';
import {Dataset} from '../../model/dataset';
import {DatasetService} from '../../service/dataset.service';
import {ProjectData} from '../../model/project-data';
import {DrawCanvasComponent} from '../draw-canvas/draw-canvas.component';

@Component({
  selector: 'app-image-list',
  templateUrl: './image-list.component.html',
  styleUrls: ['./image-list.component.scss']
})
export class ImageListComponent implements OnInit {

  private dataset: Dataset = new Dataset();

  private datasetSelected = false;

  private selectedImageId: string;

  @Input() drawCanvasComponent: DrawCanvasComponent;

  constructor(public datasetService: DatasetService) {
  }

  ngOnInit() {
  }

  public onDatasetSelection(id: string) {
    if (id !== undefined) {
      this.datasetService.getDataset(id).subscribe((data: Dataset) => {
        this.dataset = data;
        if (data.images.length > 0) {
          this.onSelectImage('', data.images[0].id);
        }
        this.datasetSelected = true;
      }, error1 => {
        console.log('Fehler beim laden der Dataset Datein');
        console.error(error1);
        this.datasetSelected = false;
      });
    }
  }

  private onSelectImage($event, id) {
    this.selectedImageId = id;
    this.drawCanvasComponent.onSelectImage(id);
  }
}
