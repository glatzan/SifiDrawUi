import {Component, OnInit, EventEmitter, Input, Output} from '@angular/core';
import {Dataset} from "../model/dataset";
import {DatasetService} from "../service/dataset.service";
import {ProjectData} from "../model/project-data";

@Component({
  selector: 'app-image-list',
  templateUrl: './image-list.component.html',
  styleUrls: ['./image-list.component.scss']
})
export class ImageListComponent implements OnInit {

  private _selectedProjectId: string;
  private dataset: Dataset = new Dataset();
  @Output() selectImage = new EventEmitter<string>();

  constructor(public datasetService: DatasetService) {
  }

  @Input()
  set selectedProjectId(selectedProjectId: string) {
    console.log('prev value: ', this._selectedProjectId);
    console.log('got name: ', selectedProjectId);
    this._selectedProjectId = selectedProjectId;

    if (this._selectedProjectId != undefined)
      this.datasetService.getDataset(selectedProjectId).subscribe((data: Dataset) => {
        this.dataset = data;
      }, error1 => {
        console.log("Fehler beim laden der Dataset Datein")
        console.error(error1);
      });
  }

  ngOnInit() {
  }

  private onSelect(event, id) {
    this.selectImage.emit(id);
  }

}
