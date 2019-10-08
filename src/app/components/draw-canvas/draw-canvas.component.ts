import {Component, OnInit, Input, ElementRef, AfterViewInit, ViewChild} from '@angular/core';
import {Layer} from '../../model/layer';
import VectorUtils from '../../utils/vector-utils';
import {Point} from '../../model/point';
import DrawUtil from '../../utils/draw-util';
import {ImageService} from '../../service/image.service';
import {CImage} from '../../model/cimage';
import CImageUtil from '../../utils/cimage-util';
import {debounceTime, flatMap} from 'rxjs/operators';
import {logger} from 'codelyzer/util/logger';
import {PointTracker} from '../../utils/point-tracker';
import {MatSnackBar} from '@angular/material';
import {ImageListComponent} from '../image-list/image-list.component';
import {PNG} from 'pngjs';
import {Readable} from 'stream';
import {Observable} from 'rxjs';
import {FilterData} from '../../worker/filter-data';
import {CPolygon} from '../../utils/cpolygon';
import {SplineUtil} from '../../utils/spline-util';

@Component({
  selector: 'app-draw-canvas',
  templateUrl: './draw-canvas.component.html',
  styleUrls: ['./draw-canvas.component.scss']
})

export class DrawCanvasComponent implements AfterViewInit {

  // a reference to the canvas element from our template
  @ViewChild('canvas', {static: false}) public canvas: ElementRef;

  private img: string;

  @Input() imageListComponent: ImageListComponent;

  readonly MOUSE_LEFT_BTN = 0;

  readonly MOUSE_RIGHT_BTN = 2;

  private cx; // CanvasRenderingContext2D

  private pointTracker: PointTracker;

  /**
   * Image Data from Backend
   */
  private image: CImage;

  private currentLayerId = 1;

  currentLayer: Layer;

  public drawImage = new Image();


  private event: MouseEvent;

  private renderContext = false;

  private currentSaveTimeout: any = undefined;

  /**
   * Scalefactor for zooming, constant
   */
  private scaleFactor = 1.05;

  /**
   * Current canvasZoom rounded for ui
   */
  private currentZoomRounded = 100;

  /**
   * True if only points should be drawn
   */
  private pointMode = 'false';

  /**
   * Size of the circle which is displayed with a right click, in px
   */
  private rightClickCircleSize = 40;

  /**
   * If true no lindes will be displayed
   */
  private hideLines = false;

  // last point of the mouse
  private lastMousePoint = new Point(0, 0);

  constructor(public imageService: ImageService,
              private snackBar: MatSnackBar) {
    // draw on load
    this.drawImage.onload = () => {
      this.canvasRedraw();
    };
  }

  public ngAfterViewInit() {
    console.log('Image load');
    this.cx = this.canvas.nativeElement.getContext('2d');
    this.initializeCanvas();
  }

  private initializeCanvas() {
    const me = this;

    // start position for canvas drag
    let dragStartPos = null;
    // true if the canvas is dragged
    let dragged = false;
    // true if alt btn was pressed while the mouse was clicked
    let btnAlt = false;
    // true if ctrl btn was pressed while the mouse was clicked
    let btnCtrl = false;
    // true if the mouse was clicked
    let mouseClicked = false;
    // number of the mouse btn
    let mouseBtn = -1;
    // current canvas zoom
    let currentZoom = 100;

    this.pointTracker = new PointTracker(this.cx);

    const zoomFunction = (clicks) => {
      const pt = me.cx.transformedPoint(this.lastMousePoint.x, this.lastMousePoint.y);
      me.cx.translate(pt.x, pt.y);
      const factor = Math.pow(me.scaleFactor, clicks);
      currentZoom = currentZoom * factor;
      me.currentZoomRounded = Math.round(currentZoom);
      me.cx.scale(factor, factor);
      me.cx.translate(-pt.x, -pt.y);
      me.canvasRedraw();
    };

    const scroll = ($event) => {
      console.log('scroll');
      const delta = $event.wheelDelta ? $event.wheelDelta / 40 : $event.detail ? -$event.detail : 0;
      if (mouseClicked && mouseBtn === me.MOUSE_RIGHT_BTN) {
        if (delta > 0) {
          me.rightClickCircleSize = me.rightClickCircleSize + 2;
        } else {
          me.rightClickCircleSize = me.rightClickCircleSize - 2;
        }
        const pt = me.cx.transformedPoint(this.lastMousePoint.x, this.lastMousePoint.y);
        me.canvasRedraw();
        DrawUtil.drawCircle(this.cx, new Point(pt.x, pt.y), this.rightClickCircleSize);
      } else {
        if (delta) {
          zoomFunction(delta);
        }
      }
      return $event.preventDefault() && false;
    };

    const setLastPoint = (evt) => {
      this.lastMousePoint.x = evt.offsetX || (evt.pageX - me.canvas.nativeElement.offsetLeft);
      this.lastMousePoint.y = evt.offsetY || (evt.pageY - me.canvas.nativeElement.offsetTop);
    };

    this.canvas.nativeElement.addEventListener('DOMMouseScroll', scroll, false);
    this.canvas.nativeElement.addEventListener('mousewheel', scroll, false);

    this.canvas.nativeElement.addEventListener('keydown', ($event) => {
      console.log($event.key);
      console.log('hallo');
      return $event.preventDefault() && false;
    }, false);

    window.addEventListener('keydown', ($event) => {
      if (me.renderContext) {
        if ($event.key == ' ' || $event.key == 'ArrowDown') {
          // next image
          if (this.imageListComponent.onSelectNextImage() != null) {
            this.snackBar.open('Nächstes Bild');
          }
        } else if ($event.key == 'ArrowUp') {
          // previouse image
          if (this.imageListComponent.onSelectPrevImage() != null) {
            this.snackBar.open('Vorheriges Bild');
          }
        } else if (!isNaN(Number($event.key))) {
          const layer = CImageUtil.findOrAddLayer(this.image, $event.key);
          this.currentLayer = layer;
          this.snackBar.open(`Layer ${layer.id} ausgewählt`);
        } else if ($event.key == 'h') {
          this.hideLines = !this.hideLines;
          this.snackBar.open(`Linien ${this.hideLines ? 'ausgeblendet' : 'eingeblendet'}`);
          this.canvasRedraw();
        } else if ($event.key == 'r') {
          this.canvasResetZoom();
        } else {
          console.log($event.key);
        }
      }
    }, false);

    /**
     * Event for mouse down
     */
    this.canvas.nativeElement.addEventListener('mousedown', (evt) => {
      setLastPoint(evt);
      btnAlt = evt.altKey;
      btnCtrl = evt.ctrlKey;
      mouseClicked = true;
      mouseBtn = evt.button;

      console.log('Mouse clicked');

      // dragging or zooming via click
      if (btnAlt) {
        btnAlt = true;
        dragged = false;
        dragStartPos = me.cx.transformedPoint(this.lastMousePoint.x, this.lastMousePoint.y);
        // alternate mode
      } else if (btnCtrl) {
        if (mouseBtn === me.MOUSE_LEFT_BTN) {
          CImageUtil.addLine(me.currentLayer);
        }
      } else {
        if (mouseBtn == me.MOUSE_LEFT_BTN) {
          const pt = me.cx.transformedPoint(this.lastMousePoint.x, this.lastMousePoint.y);
          CImageUtil.addPointToCurrentLine(this.currentLayer, pt.x, pt.y);
          me.saveContent();
          me.canvasRedraw();
        }
      }
    }, false);

    /**
     * Event for mouse move
     */
    this.canvas.nativeElement.addEventListener('mousemove', (evt) => {
      setLastPoint(evt);

      if (mouseClicked) {
        // move
        if (btnAlt) {
          if (dragStartPos === null) {
            return;
          }
          dragged = true;
          const pt = me.cx.transformedPoint(this.lastMousePoint.x, this.lastMousePoint.y);
          me.cx.translate(pt.x - dragStartPos.x, pt.y - dragStartPos.y);
          me.canvasRedraw();
        } else {
          console.log(mouseBtn);
          const pt = me.cx.transformedPoint(this.lastMousePoint.x, this.lastMousePoint.y);
          // draw
          switch (mouseBtn) {
            case me.MOUSE_LEFT_BTN:
              if (me.pointMode === 'false') {
                CImageUtil.addPointToCurrentLine(this.currentLayer, pt.x, pt.y);
                me.saveContent();
                me.canvasRedraw();
              }
              break;
            case me.MOUSE_RIGHT_BTN:
              // check ctrl key again, for better editing
              if (evt.ctrlKey) {
                if (VectorUtils.removeCollidingPointListsOfCircle(me.currentLayer.lines, new Point(pt.x, pt.y), me.rightClickCircleSize)) {
                  this.saveContent();
                }
              } else {
                if (VectorUtils.movePointListsToCircleBoundaries(me.currentLayer.lines, new Point(pt.x, pt.y), me.rightClickCircleSize)) {
                  this.saveContent();
                }
              }
              me.canvasRedraw();
              DrawUtil.drawCircle(this.cx, new Point(pt.x, pt.y), this.rightClickCircleSize);
              break;
          }
        }
      }
    }, false);

    /**
     * Event for mouse up
     */
    this.canvas.nativeElement.addEventListener('mouseup', (evt) => {
      mouseClicked = false;

      // zooming on click
      if (btnAlt && !dragged) {
        zoomFunction(btnCtrl ? -1 : 1);
      }

    }, false);
  }

  /**
   * Redraws the canvas
   */
  private canvasRedraw() {
    this.clearCanvas();
    this.cx.drawImage(this.drawImage, 0, 0);

    if (!this.hideLines) {
      DrawUtil.redrawCanvas(this.cx, this.image.layers);
    }
  }

  /**
   * Resets the canvas transformations
   */
  public canvasResetZoom() {
    this.cx.setTransform(1, 0, 0, 1, 0, 0);
    this.canvasRedraw();
  }

  /**
   * Clears the whole canvas
   */
  private clearCanvas() {
    this.cx.save();
    this.cx.setTransform(1, 0, 0, 1, 0, 0);
    this.cx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    this.cx.restore();
  }

  public onSelectImage(selectedImageId: string) {
    if (selectedImageId !== undefined) {
      this.imageService.getImage(selectedImageId).subscribe((data: CImage) => {
        console.log('Image select');
        console.log(data);
        this.prepareImage(data);
      }, error1 => {
        console.log('Fehler beim laden der Dataset Datein');
        console.error(error1);
      });
    }
  }

  private prepareImage(image: CImage) {
    // save manually if image should be changed
    if (this.currentSaveTimeout !== undefined) {
      this.cancelSaveTimeout();
      this.save();
    }

    CImageUtil.prepareImage(image);
    this.image = image;
    this.currentLayer = image.layers[0];
    this.renderContext = true;
    this.drawImage.src = 'data:image/png;base64,' + this.image.data;

    // setting layer settings
    this.cx.lineWidth = image.layers[0].size || 1;
    this.cx.lineCap = 'round';
    this.cx.strokeStyle = image.layers[0].color || '#fff';
    this.cx.fillStyle = image.layers[0].color || '#fff';
  }

  public addLayer(event) {
    this.currentLayer = CImageUtil.addLayer(this.image);
  }

  public selectLine($event, index: number) {
    if ($event.ctrlKey) {
      CImageUtil.removeLine(this.currentLayer, this.currentLayer.lines[index]);
      this.saveContent();
      this.canvasRedraw();
    } else {
      this.currentLayer.line = this.currentLayer.lines[index];
    }
    // preventing default ctrl click
    return $event.preventDefault() && false;
  }

  public onEvent(event: MouseEvent): boolean {
    return false;
  }

  private highLightLine(index: number) {
    DrawUtil.drawLineOnCanvas(this.cx, this.currentLayer.lines[index], 'yellow', 4);
  }

  private saveContent() {
    this.cancelSaveTimeout();
    this.currentSaveTimeout = setTimeout(() => {
      this.save();
    }, 1000);
  }

  private cancelSaveTimeout(): void {
    clearTimeout(this.currentSaveTimeout);
    this.currentSaveTimeout = undefined;
  }

  private save() {
    console.log(this.image.id);
    this.imageService.setImage(this.image).subscribe(() => {
      console.log('saved');
    }, error1 => {
      console.log('Fehler beim laden der Dataset Datein');
      console.error(error1);
    });
  }

  private onFilterCompleted(image: CImage) {
    this.prepareImage(image);
  }

  public test() {
    function RandomSplinePoly() {
      const poly = new CPolygon();
      for (let i = 0; i < 6; i++) {
        poly.addPoint(Math.floor(Math.random() * 1300), Math.floor(Math.random() * 650));
      }
      return poly;
    }

    const splinePoly = RandomSplinePoly();

    const bezierPoly = SplineUtil.computeSplineCurve(splinePoly, 0.5, true);

    // draw each bezier segment
    const last = bezierPoly.size - 1;
    for (let i = 0; i < last; i += 3) {
      this.cx.beginPath();
      this.cx.moveTo(bezierPoly.x[i], bezierPoly.y[i]);
      this.cx.bezierCurveTo(bezierPoly.x[i + 1], bezierPoly.y[i + 1], bezierPoly.x[i + 2], bezierPoly.y[i + 2], bezierPoly.x[i + 3], bezierPoly.y[i + 3]);
      this.cx.stroke();
      // this.cx.BezierCurve(
      //   bezierPoly.x[i], bezierPoly.y[i],
      //   bezierPoly.x[i + 1], bezierPoly.y[i + 1],
      //   bezierPoly.x[i + 2], bezierPoly.y[i + 2],
      //   bezierPoly.x[i + 3], bezierPoly.y[i + 3],
      //   1 // -> draw contour only, no filling
      // );
    }
  }
}

