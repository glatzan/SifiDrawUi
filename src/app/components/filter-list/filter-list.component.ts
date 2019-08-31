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

@Component({
  selector: 'app-filter-list',
  templateUrl: './filter-list.component.html',
  styleUrls: ['./filter-list.component.scss']
})
export class FilterListComponent implements OnInit {

  private filterIsRunning = false;
  private filterValue: string;
  private _cImage: CImage;
  private resetTriggered = false

  @Input() set cImage(cImage: CImage) {
    this._cImage = cImage;
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

  public async runFilter() {

    if (this.filterValue === undefined || this.filterValue.length == 0) {
      console.log(this.filterValue + "---")
      return;
    }
    const me = this;
    me.filterIsRunning = true;
    const cImage = await this.imageService.getImage(this._cImage.id).toPromise();
    DrawUtil.loadImageFromBase64(cImage.data, img => {
      const f = me.filterService;
      let end = undefined;
      let start = undefined;
      try {
        eval(me.filterValue);
      } catch (e) {
        if (e instanceof SyntaxError) {
          alert(e);
        }
        alert(e);
        me.filterIsRunning = false;
        return
      }
      const endFilter = this.filterService.getNewEventFilter(end, this.filterCallBack, me, me._cImage);
      start.doFilter(img, undefined);
      console.log("end");
    })
  }

  public resetFilter(event) {
    this.resetTriggered = this.filterIsRunning;
    this.imageService.getImage(this._cImage.id).subscribe( x =>{
      this.filterOutput.emit(x)
    })
  }

  public filterCallBack(image: CImage) {
    this.filterIsRunning = false;

    if (!this.resetTriggered)
      this.filterOutput.emit(image)
    else
      this.resetTriggered = false;
  }


}


// public filter = [
//   {
//     category: "Split", filter: [
//       {
//         name: "Split-Filter",
//         description: "Ausplitten des Filterbaumes",
//         command: "const split = new SplitFilter(img);"
//       }
//     ]
//   },
//   {
//     category: "Merge", filter: [
//       {
//         name: "Img-Merge-Filter",
//         description: "Ausplitten des Filterbaumes",
//         command: "const merge = new IMGMergeFilter(imgs, colors);"
//       }
//     ]
//   }
// ]
