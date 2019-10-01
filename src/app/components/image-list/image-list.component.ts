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

  /**
   * Selects the next image. If no image is selected the first image will be selected
   * @param $event
   */
  public onSelectNextImage(): string {
    if (this.dataset.images == undefined || this.dataset.images.length == 0) {
      return;
    }

    for (let i = 0; i < this.dataset.images.length; i++) {
      if (this.dataset.images[i].id == this.selectedImageId) {
        if (i + 1 < this.dataset.images.length) {
          this.onSelectImage(NaN, this.dataset.images[i + 1].id)
          return this.dataset.images[i + 1].id;
        } else
          return null;
      }
    }

    this.onSelectImage(NaN, this.dataset.images[0].id);
    return this.dataset.images[0].id;
  }

  /**
   * Selected the previous image. If no image is selected the first image will be selected
   * @param $event
   */
  public onSelectPrevImage() {
    if (this.dataset.images == undefined || this.dataset.images.length == 0) {
      return;
    }

    for (let i = 0; i < this.dataset.images.length; i++) {
      if (this.dataset.images[i].id == this.selectedImageId) {
        if (i - 1 >= 0) {
          this.onSelectImage(NaN, this.dataset.images[i - 1].id);
          return this.dataset.images[i + 1].id;
        } else
          return null;
      }
    }

    this.onSelectImage(NaN, this.dataset.images[0].id);
    return this.dataset.images[0].id;
  }
}
