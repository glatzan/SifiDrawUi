import {Component} from '@angular/core';
import {Dataset} from "./model/dataset";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'SifiDrawUi';

  private selectedDatasetId: String;

  private dataset : Dataset

  onDatasetSelect(id: String) {
    console.log(id)
    this.selectedDatasetId = id
  }
}

