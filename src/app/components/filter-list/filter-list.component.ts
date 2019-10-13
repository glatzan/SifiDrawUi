import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ImageListComponent} from "../image-list/image-list.component";
import {DrawCanvasComponent} from "../draw-canvas/draw-canvas.component";
import * as ts from "typescript";
import {CImage} from "../../model/cimage";
import {ImageService} from "../../service/image.service";
import {ImageMagicService} from "../../service/image-magic.service";
import {ImageMagicFilter} from "../../filter/image-magic-filter";
import DrawUtil from "../../utils/draw-util";
import {FilterService} from "../../service/filter.service";
import {ImageEventFilter} from "../../filter/image-event-filter";
import {HttpClient} from "@angular/common/http";
import {logger} from "codelyzer/util/logger";
import {Dataset} from "../../model/dataset";
import {forkJoin} from "rxjs";
import {DisplayCallback} from "../../worker/display-callback";

@Component({
  selector: 'app-filter-list',
  templateUrl: './filter-list.component.html',
  styleUrls: ['./filter-list.component.scss']
})
export class FilterListComponent implements OnInit, DisplayCallback {

  private filterIsRunning = false;
  private filterValue: string;
  private _cImage: CImage;
  private resetTriggered = false
  private doNotResetFilter = false


  @Input() set cImage(cImage: CImage) {
    this._cImage = cImage;
    console.log("Loading Image")
    if (this.doNotResetFilter) {
      this.doNotResetFilter = false;
      return;
    }
    this._http.get('assets/defaultFilterValue.txt', {responseType: 'text' as 'json'}).subscribe(x => {
      this.filterValue = x.toString();
    })
  }

  @Output() filterOutput = new EventEmitter<CImage>();

  constructor(public imageMagicService: ImageMagicService,
              private imageService: ImageService,
              private filterService: FilterService,
              private _http: HttpClient) {
  }

  ngOnInit() {
  }

  public runFilter() {

    if (this.filterValue === undefined || this.filterValue.length == 0) {
      console.log(this.filterValue + "---")
      return;
    }

    const dataset = new Dataset();
    dataset.images = [new CImage()]
    dataset.images[0].id = this._cImage.id;

    this.filterService.runFilterOnDataset(dataset, this.filterValue, {
      displayCallback: this
    });
  }

  public resetFilter() {
    this.resetTriggered = this.filterIsRunning;
    this.imageService.getImage(this._cImage.id).subscribe(x => {
      this._cImage.data = x.data
      this.filterOutput.emit(this._cImage)
    })
  }

  public displayCallBack(image: CImage): void {
    this.filterIsRunning = false;

    this.doNotResetFilter = true;

    console.log("callback")
    if (!this.resetTriggered)
      this.filterOutput.emit(image)
    else
      this.resetTriggered = false;
  }
}
