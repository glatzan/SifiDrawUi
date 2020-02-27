import {Component, OnInit, ViewChild} from '@angular/core';
import {Dataset} from '../../model/dataset';
import {DatasetService} from '../../service/dataset.service';
import {WorkViewService} from '../workView/work-view.service';
import {ImageGroupService} from '../../service/image-group.service';
import {MatMenuTrigger} from '@angular/material/menu';

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

  private datasetSelected = false;

  private selectedImageId: string;

  constructor(private datasetService: DatasetService,
              private workViewService: WorkViewService,
              private imageGroupService: ImageGroupService) {
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

  public reload() {
    this.datasetService.getDataset(this.dataset.id).subscribe((data: Dataset) => {
      this.dataset = data;
    });
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
