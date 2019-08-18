import {Component, OnInit, EventEmitter, Input, Output} from '@angular/core';
import {Dataset} from '../model/dataset';
import {DatasetService} from '../service/dataset.service';
import {ProjectData} from '../model/project-data';

@Component({
  selector: 'app-image-list',
  templateUrl: './image-list.component.html',
  styleUrls: ['./image-list.component.scss']
})
export class ImageListComponent implements OnInit {

  private dataset: Dataset = new Dataset();

  private selectedImageId: string

  @Output() selectImage = new EventEmitter<string>();

  constructor(public datasetService: DatasetService) {
  }

  @Input()
  set selectedProjectId(selectedProjectId: string) {

    if (selectedProjectId !== undefined) {
      this.datasetService.getDataset(selectedProjectId).subscribe((data: Dataset) => {
        this.dataset = data;
        if (data.images.length > 0)
          this.onSelect("", data.images[0].id);
      }, error1 => {
        console.log('Fehler beim laden der Dataset Datein');
        console.error(error1);
      });
    }
  }

  ngOnInit() {
  }

  private onSelect(event, id) {
    this.selectedImageId = id;
    this.selectImage.emit(id);
  }

}
