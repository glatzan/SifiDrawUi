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

@Component({
  selector: 'app-filter-list',
  templateUrl: './filter-list.component.html',
  styleUrls: ['./filter-list.component.scss']
})
export class FilterListComponent implements OnInit {

  @Input() cImage: CImage;
  @Output() filterOutput = new EventEmitter<CImage>();

  private filterIsRunning = false;

  public filter = [
    {
      category: "Split", filter: [
        {
          name: "Split-Filter",
          description: "Ausplitten des Filterbaumes",
          command: "const split = new SplitFilter(img);"
        }
      ]
    },
    {
      category: "Merge", filter: [
        {
          name: "Img-Merge-Filter",
          description: "Ausplitten des Filterbaumes",
          command: "const merge = new IMGMergeFilter(imgs, colors);"
        }
      ]
    }
  ]

  private filterValue: string;

  constructor(public imageMagicService: ImageMagicService,
              private imageService: ImageService,
              private filterService: FilterService) {
  }

  ngOnInit() {
  }

  public async runFilter() {

    if (this.filterValue === undefined || this.filterValue.length == 0) {
      console.log(this.filterValue + "---")
      return;
    }


    const me = this;
    console.log(this);
    this.filterIsRunning = true;
    const cImage = await this.imageService.getImage(this.cImage.id).toPromise();
    DrawUtil.loadImageFromBase64(cImage.data, img => {
      const f = me.filterService;
      let end = undefined;
      let start = undefined;
      eval(me.filterValue);
      const endFilter = this.filterService.getNewEventFilter(end, this.filterCallBack, me, me.cImage);
      start.doFilter(img, undefined);
      console.log("end");

    //   let code = `({
    // Run: ()=> {
    //      const f = me.filterService;
    //     ${me.filterValue}
    //     const endFilter = this.filterService.getNewEventFilter(end, this.filterCallBack, me, me.cImage)
    //     start.doFilter(img, undefined)
    //      console.log("end");
    //     }
    // })`;
    //   let result = ts.transpile(code);
    //   let runnalbe: any = eval(result);
    //   runnalbe.Run();


      // start = f.getNewMagicFilter(undefined, "-resize 128x128");
      // const f1 = f.getNewMagicFilter(start, "-level 25%,75%");
      // end = tf.getNewMagicFilter(f1, "+level-colors green,gold");

      /*

      start = f.getNewMagicFilter(undefined, "-resize 128x128");
      const f1 = f.getNewMagicFilter(start, "-level 25%,75%");
      end = f.getNewMagicFilter(f1, "+level-colors green,gold");

       */
    })
  }

  public filterCallBack(image: CImage) {
    this.filterIsRunning = false;
    this.filterOutput.emit(image)
  }


}
