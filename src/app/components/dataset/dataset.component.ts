import {Component, OnInit, ViewChild} from '@angular/core';
import {Dataset} from '../../model/dataset';
import {DatasetService} from '../../service/dataset.service';
import {WorkViewService} from '../workView/work-view.service';
import {ImageGroupService} from '../../service/image-group.service';
import {MatMenuTrigger} from '@angular/material/menu';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ICImage} from '../../model/ICImage';
import {ImageService} from '../../service/image.service';
import {CImageGroup} from '../../model/CImageGroup';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.scss']
})
export class DatasetComponent implements OnInit {

  @ViewChild(MatMenuTrigger, {static: false})
  contextMenu: MatMenuTrigger;

   contextMenuPosition = {x: '0px', y: '0px'};

  dataset: Dataset = new Dataset();

  controls: FormArray;

  datasetSelected = false;

  selectedImageId: string;

  constructor(private datasetService: DatasetService,
              private workViewService: WorkViewService,
              private imageGroupService: ImageGroupService,
              private formBuilder: FormBuilder,
              private imageService: ImageService,
              private snackBar: MatSnackBar) {
  }

  public ngOnInit() {
    this.workViewService.nextSelectImageInDataset.subscribe(x => {
      this.onSelectNextImage();
      this.snackBar.open('Nächstes Bild');
    });

    this.workViewService.prevSelectImageInDataset.subscribe(x => {
      this.onSelectPrevImage();
      this.snackBar.open('Vorheriges Bild');
    });

    this.workViewService.selectDataset.subscribe(x => {
      this.loadDataset(x.id);
    });
  }

  public loadDataset(datasetID: string) {
    this.datasetService.getDataset(datasetID).subscribe((data: Dataset) => {
      if (this.dataset.id !== data.id && data.images.length > 0) {
        this.onSelectImage('', data.images[0]);
      }
      this.dataset = data;
      this.datasetSelected = true;
      this.controls = this.formBuilder.array(this.addFormGroups(this.dataset.images));
    }, error1 => {
      console.log('Fehler beim laden der Dataset Datein');
      console.error(error1);
      this.datasetSelected = false;
    });
  }

  private reload() {
    this.loadDataset(this.dataset.id);
  }

  onSelectImage($event, image: ICImage) {
    this.selectedImageId = image.id;
    this.workViewService.selectImage(image);
  }


  private addFormGroups(data: ICImage[]): FormGroup[] {
    let result = [];
    if (data === undefined) {
      return result;
    }
    data.forEach(x => {
      result.push(this.formBuilder.group({
          name: [x.name, Validators.required],
          item: [x],
        }
      ));
      if (x.type === 'group') {
        result = result.concat(this.addFormGroups((x as CImageGroup).images));
      }
    });
    return result;
  }

  getControl(index: number, field: string): FormControl {
    return this.controls.at(index).get(field) as FormControl;
  }

  updateField(index: number, field: string) {
    const control = this.getControl(index, field);
    if (control.valid) {
      const item = this.getControl(index, 'item');
      item.value.name = control.value;
      if (item.value.type === 'group') {
        this.imageGroupService.updateImageGroup(item.value).subscribe();
      } else {
        this.imageService.updateImage(item.value).subscribe();
      }

    }
  }

  getIndex(element: ICImage) {
    let counter = 0;
    for (const img of this.dataset.images) {
      if (img.id === element.id) {
        return counter;
      }
      counter++;
      if (img.type === 'group') {
        for (const subimg of (img as CImageGroup).images) {
          if (subimg.id === element.id) {
            return counter;
          }
          counter++;
        }
      }
    }
  }


  /**
   * Selects the next image. If no image is selected the first image will be selected
   */
  onSelectNextImage(): string {
    if (this.dataset.images === undefined || this.dataset.images.length === 0) {
      return;
    }

    for (let i = 0; i < this.dataset.images.length; i++) {
      if (this.dataset.images[i].id === this.selectedImageId) {
        if (i + 1 < this.dataset.images.length) {
          this.onSelectImage(NaN, this.dataset.images[i + 1]);
          return this.dataset.images[i + 1].id;
        } else {
          return null;
        }
      }
    }

    this.onSelectImage(NaN, this.dataset.images[0]);
    return this.dataset.images[0].id;
  }

  /**
   * Selected the previous image. If no image is selected the first image will be selected
   */
  onSelectPrevImage() {
    if (this.dataset.images == undefined || this.dataset.images.length == 0) {
      return;
    }

    for (let i = 0; i < this.dataset.images.length; i++) {
      if (this.dataset.images[i].id == this.selectedImageId) {
        if (i - 1 >= 0) {
          this.onSelectImage(NaN, this.dataset.images[i - 1]);
          return this.dataset.images[i + 1].id;
        } else {
          return null;
        }
      }
    }

    this.onSelectImage(NaN, this.dataset.images[0]);
    return this.dataset.images[0].id;
  }

  drop($event, imageGroup) {
    // let img = $event.item.data;
    // let preElement = $event.previousContainer.data
    // let newElement = imageGroup
    //
    // const index = preElement.images.indexOf(img);
    // if (index > -1) {
    //   preElement.images.splice(index, 1);
    // }
    //
    // newElement.images.push(img)
    if ($event.previousContainer.data === $event.container.data) {
      return;
    }

    this.imageGroupService.addImageToGroup(imageGroup, $event.item.data).subscribe(_ => {
      this.reload();
    });
  }

  public createImageGroup() {
    this.imageGroupService.createImageGroup(this.dataset, 'New Group').subscribe(_ => {
      this.reload();
    });
  }

  public onContextMenu($event: MouseEvent) {
    console.log('asd');
    $event.preventDefault();
    this.contextMenuPosition.x = $event.clientX + 'px';
    this.contextMenuPosition.y = $event.clientY + 'px';
    this.contextMenu.menuData = {item: 'asd'};
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }
}
