import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {CImage} from "../../../model/CImage";
import {HistogramData, HistogramFilter} from "../../../worker/filter/histogram-filter";
import {WorkViewService} from "../work-view.service";
import {ImageService} from "../../../service/image.service";
import {FilterHelper} from "../../../worker/filter/filter-helper";
import DrawUtil from "../../../utils/draw-util";
import {InitializeFilter} from "../../../worker/filter/initialize-filter";
import {iif, of} from "rxjs";
import {flatMap} from "rxjs/operators";

@Component({
  selector: 'app-histo-view',
  templateUrl: './histo-view.component.html',
  styleUrls: ['./histo-view.component.scss']
})
export class HistoViewComponent implements OnInit {

  // a reference to the canvas element from our template
  @ViewChild('histocanvas', {static: false}) public canvas: ElementRef;

  renderHistogram: boolean = false;

  displayImage: CImage;

  histogramData: HistogramData;

  constructor(private workViewService: WorkViewService,
              private imageService: ImageService) {
  }

  ngOnInit() {

    this.histogramData = new HistogramData();

    this.workViewService.onRenderImageTools.subscribe(renderHistogram => {
      this.renderHistogram = renderHistogram;
      if (renderHistogram && this.displayImage) {
        this.showHistogram(this.displayImage);
      }
    });

    this.workViewService.onChangeDisplayImage.subscribe(image => {
      this.displayImage = image;

      if (this.renderHistogram) {
        this.showHistogram(this.displayImage);
      }
    });
  }


  showHistogram(image: CImage) {
    of(image).pipe(
      flatMap((image: CImage) =>
        iif(() => image.id === "tmp",
          of(image),
          this.workViewService.getPNGFromBuffer(image.id)
        )
      ),
      (new InitializeFilter(null).doFilter()),
      (new HistogramFilter(null).doFilter(0, 0, {targetData: "histogram"}))
    ).subscribe(x => {
      const cx = FilterHelper.get2DContext(this.canvas.nativeElement);
      DrawUtil.drawRect(cx, 0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height, "#fff");
      HistogramFilter.drawHistogram(this.canvas.nativeElement, x.getData("histogram").data);
      this.histogramData = x.getData("histogram");
      console.log("Histogram")
      console.log(x)
    })
  }


}
