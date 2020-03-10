import {Component, OnInit} from '@angular/core';
import {CImage} from "../../../model/CImage";
import {iif, Observable, of} from "rxjs";
import {flatMap} from "rxjs/operators";
import {InitializeFilter} from "../../../worker/filter/initialize-filter";
import {HistogramFilter} from "../../../worker/filter/histogram-filter";
import {WorkViewService} from "../work-view.service";
import {ICImage} from "../../../model/ICImage";
import {ImageService} from "../../../service/image.service";

@Component({
  selector: 'app-histo-view',
  templateUrl: './histo-view.component.html',
  styleUrls: ['./histo-view.component.css']
})
export class HistoViewComponent implements OnInit {

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
      (new HistogramFilter(null).doFilter(0, 0, {}))
    ).subscribe(x => {
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
