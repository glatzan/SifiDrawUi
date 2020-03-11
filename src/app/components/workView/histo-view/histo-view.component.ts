import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {CImage} from "../../../model/CImage";
import {iif, Observable, of} from "rxjs";
import {flatMap, tap} from "rxjs/operators";
import {InitializeFilter} from "../../../worker/filter/initialize-filter";
import {HistogramFilter} from "../../../worker/filter/histogram-filter";
import {WorkViewService} from "../work-view.service";
import {ICImage} from "../../../model/ICImage";
import {ImageService} from "../../../service/image.service";
import {FilterHelper} from "../../../worker/filter/filter-helper";
import DrawUtil from "../../../utils/draw-util";

@Component({
  selector: 'app-histo-view',
  templateUrl: './histo-view.component.html',
  styleUrls: ['./histo-view.component.scss']
})
export class HistoViewComponent implements OnInit {

  // a reference to the canvas element from our template
  @ViewChild('histocanvas', {static: false}) public canvas: ElementRef;

  constructor(private workViewService: WorkViewService,
              private imageService: ImageService) {
  }

  pngImageBuffer: ICImage[] = [];

  ngOnInit() {
    this.workViewService.onChangedParentImage.subscribe(image => {
      this.showHistogram(image.getImage())
    });

    this.workViewService.onChangedActiveImage.subscribe(image => {
      this.showHistogram(image.getImage())
    });
  }

  showHistogram(image: CImage) {
    of(image).pipe(
      flatMap((data: CImage) =>
        iif(() => this.getImageFromBuffer(data.getImage().id) == null,
          this.imageService.getImage(data.getImage().id).pipe(
            flatMap((data: CImage) => new Observable<CImage>((observer) => {
                this.pngImageBuffer.push(data);
                if (this.pngImageBuffer.length > 10) {
                  this.pngImageBuffer.splice(0, 1)
                }
                observer.next(data);
                observer.complete();
              }),
            )
          ),
          of(this.getImageFromBuffer(data.id))
        )),
      (new InitializeFilter(null).doFilter()),
      (new HistogramFilter(null).doFilter(0, 0, {targetData: "histogram"})),
      tap(data => {
      })
    ).subscribe(x => {
      const cx = FilterHelper.get2DContext(this.canvas.nativeElement);
      DrawUtil.drawRect(cx, 0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height, "#fff");
      HistogramFilter.drawHistogram(this.canvas.nativeElement, x.getData("histogram"));
      console.log(x)
    })
  }

  public getImageFromBuffer(id: string) {
    for (let img of this.pngImageBuffer) {
      if (img.id === id)
        return img;
    }
    return null;
  }
}
