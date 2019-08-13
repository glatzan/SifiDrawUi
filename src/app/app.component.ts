import {Component} from '@angular/core';
import {Dataset} from './model/dataset';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'SifiDrawUi';

  private selectedDatasetId: string;
  private selectedImageId: string;

  onDatasetSelect(id: string) {
    console.log(id);
    this.selectedDatasetId = id;
  }

  onImageSelect(id: string) {
    console.log(id);
    this.selectedImageId = id;
  }
}

