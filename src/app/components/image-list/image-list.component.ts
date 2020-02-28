import {Component, OnInit, ViewChild} from '@angular/core';
import {Dataset} from '../../model/dataset';
import {DatasetService} from '../../service/dataset.service';
import {WorkViewService} from '../workView/work-view.service';
import {ImageGroupService} from '../../service/image-group.service';
import {MatMenuTrigger} from '@angular/material/menu';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ICImage} from "../../model/ICImage";
import {ImageService} from "../../service/image.service";
import {CImageGroup} from "../../model/CImageGroup";

@Component({
  selector: 'app-image-list',
  templateUrl: './image-list.component.html',
  styleUrls: ['./image-list.component.scss']
})
export class ImageListComponent implements OnInit {

  @ViewChild(MatMenuTrigger)
  contextMenu: MatMenuTrigger;

  contextMenuPosition = {x: '0px', y: '0px'};

  private dataset: Dataset = new Dataset();

  controls: FormArray;

  private datasetSelected = false;

  private selectedImageId: string;

  constructor(private datasetService: DatasetService,
              private workViewService: WorkViewService,
              private imageGroupService: ImageGroupService,
              private formBuilder: FormBuilder,
              private imageService: ImageService) {
  }

  public onDatasetSelection(id: string) {
    this.datasetService.getDataset(id).subscribe((data: Dataset) => {
      if (this.dataset.id !== data.id && data.images.length > 0) {
        this.onSelectImage('', data.images[0].id);
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

  private addFormGroups(data: ICImage[]): FormGroup[] {
    console.log(data)
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
        result = result.concat(this.addFormGroups((x).images));
      }
    });
    return result;
  }

  public getControl(index: number, field: string): FormControl {
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

  public getIndex(element: ICImage) {
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

  public reload() {
    this.onDatasetSelection(this.dataset.id);
  }

  private onSelectImage($event, id) {
    console.log('Selecting img ' + id);
    this.selectedImageId = id;
    this.workViewService.displayImageById(id);
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
          this.onSelectImage(NaN, this.dataset.images[i + 1].id);
          return this.dataset.images[i + 1].id;
        } else {
          return null;
        }
      }
    }

    this.onSelectImage(NaN, this.dataset.images[0].id);
    return this.dataset.images[0].id;
  }

  /**
   * Selected the previous image. If no image is selected the first image will be selected
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
        } else {
          return null;
        }
      }
    }

    this.onSelectImage(NaN, this.dataset.images[0].id);
    return this.dataset.images[0].id;
  }

  public drop($event, imageGroup) {
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
    console.log($event)
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
