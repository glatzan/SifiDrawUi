import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {CImage} from "../../../model/CImage";
import {HistogramFilter} from "../../../worker/filter/histogram-filter";
import {WorkViewService} from "../work-view.service";
import {ImageService} from "../../../service/image.service";
import {FilterHelper} from "../../../worker/filter/filter-helper";
import DrawUtil from "../../../utils/draw-util";
import {InitializeFilter} from "../../../worker/filter/initialize-filter";

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

  constructor(private workViewService: WorkViewService,
              private imageService: ImageService) {
  }

  ngOnInit() {
      this.workViewService.onRenderImageTools.subscribe(renderHistogram => {
        this.renderHistogram = renderHistogram;
        if (renderHistogram && this.displayImage) {
          this.showHistogram(this.displayImage.id);
        }
      });

      this.workViewService.onChangeDisplayImage.subscribe(image => {
        this.displayImage = image;

        if (this.renderHistogram) {
          this.showHistogram(this.displayImage.id);
        }
      });
  }


  showHistogram(imageID: string) {
    this.workViewService.getPNGFromBuffer(imageID).pipe(
      (new InitializeFilter(null).doFilter()),
      (new HistogramFilter(null).doFilter(0, 0, {targetData: "histogram"})),
    ).subscribe(x => {
      const cx = FilterHelper.get2DContext(this.canvas.nativeElement);
      DrawUtil.drawRect(cx, 0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height, "#fff");
      HistogramFilter.drawHistogram(this.canvas.nativeElement, x.getData("histogram"));
      console.log(x)
    })
  }


}
