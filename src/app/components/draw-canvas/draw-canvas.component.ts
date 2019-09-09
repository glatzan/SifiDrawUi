import {Component, OnInit, Input, ElementRef, AfterViewInit, ViewChild} from '@angular/core';
import {Layer} from '../../model/layer';
import VectorUtils from '../../utils/vector-utils';
import {Point} from '../../model/point';
import DrawUtil from '../../utils/draw-util';
import {ImageService} from '../../service/image.service';
import {CImage} from '../../model/cimage';
import CImageUtil from '../../utils/cimage-util';
import {debounceTime} from 'rxjs/operators';
import {logger} from 'codelyzer/util/logger';
import {PointTracker} from '../../utils/point-tracker';

@Component({
  selector: 'app-draw-canvas',
  templateUrl: './draw-canvas.component.html',
  styleUrls: ['./draw-canvas.component.scss']
})

export class DrawCanvasComponent implements AfterViewInit {

  // a reference to the canvas element from our template
  @ViewChild('canvas', {static: false}) public canvas: ElementRef;

  readonly MOUSE_LEFT_BTN = 1;
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

  public width = 1300;

  public height = 650;

  private rightClickCircleSize: number;

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

  constructor(public imageService: ImageService) {
    // draw on load
    this.drawImage.onload = () => {
      this.canvasRedraw();
    };
  }

  public ngAfterViewInit() {

    console.log('Image load');
    // set some default properties about the line
    this.cx.lineWidth = 1;
    this.cx.lineCap = 'round';
    this.cx.strokeStyle = '#fff';
    this.cx.fillStyle = '#ff0000';

    // set the width and height
    this.canvas.nativeElement.width = this.width;
    this.canvas.nativeElement.height = this.height;

    this.cx = this.canvas.nativeElement.getContext('2d');

    this.rightClickCircleSize = 40;

    this.initializeCanvas();
  }

  private initializeCanvas() {
    const me = this;

    // last point of the mouse
    const lastMousePoint = new Point(0, 0);
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
      const pt = me.cx.transformedPoint(lastMousePoint.x, lastMousePoint.y);
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
      if (delta) {
        zoomFunction(delta);
      }
      return $event.preventDefault() && false;
    };

    const setLastPoint = (evt) => {
      lastMousePoint.x = evt.offsetX || (evt.pageX - me.canvas.nativeElement.offsetLeft);
      lastMousePoint.y = evt.offsetY || (evt.pageY - me.canvas.nativeElement.offsetTop);
    };

    this.canvas.nativeElement.addEventListener('DOMMouseScroll', scroll, false);
    this.canvas.nativeElement.addEventListener('mousewheel', scroll, false);

    /**
     * Event for mouse down
     */
    this.canvas.nativeElement.addEventListener('mousedown', (evt) => {
      setLastPoint(evt);
      btnAlt = evt.altKey;
      btnCtrl = evt.ctrlKey;
      mouseClicked = true;
      mouseBtn = evt.mouseButton;

      // dragging or zooming via click
      if (btnAlt) {
        btnAlt = true;
        dragged = false;
        dragStartPos = me.cx.transformedPoint(lastMousePoint.x, lastMousePoint.y);
        // alternate mode
      } else if (btnCtrl) {
        if (mouseBtn === me.MOUSE_LEFT_BTN) {
          CImageUtil.newLine(me.currentLayer);
        }
      } else {
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
          const pt = me.cx.transformedPoint(lastMousePoint.x, lastMousePoint.y);
          me.cx.translate(pt.x - dragStartPos.x, pt.y - dragStartPos.y);
          me.canvasRedraw();
        } else {
          // draw
          switch (mouseBtn) {
            case me.MOUSE_LEFT_BTN:
              me.newLineOnCanvas(this.currentLayer, lastMousePoint);
              me.saveContent();
              me.canvasRedraw();
              break;
            case me.MOUSE_RIGHT_BTN:
              if (btnCtrl) {
                if (VectorUtils.removeCollidingPointListsOfCircle(me.currentLayer.lines, lastMousePoint, me.rightClickCircleSize)) {
                  this.saveContent();
                }
              } else {
                if (VectorUtils.movePointListsToCircleBoundaries(me.currentLayer.lines, lastMousePoint, me.rightClickCircleSize)) {
                  this.saveContent();
                }
              }
              me.canvasRedraw();
              DrawUtil.drawCircle(this.cx, lastMousePoint, this.rightClickCircleSize);
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
    DrawUtil.redrawCanvas(this.cx, this.image.layers);
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
        console.log('Image select' + data.name);
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
  }


  /**
   * Mouse movement with right mouse button pressed
   */
  public onMouseMoveWithRightClick(event: MouseEvent, mousePos: Point) {

  }

  public addLayer(event) {
    this.image.layers = [...this.image.layers, (new Layer(this.image.layers.length + 1))];
    this.currentLayer = this.image.layers[this.image.layers.length - 1];
  }

  public selectPoints(index: number) {
    this.currentLayer.line = this.currentLayer.lines[index];
  }


  public onEvent(event: MouseEvent): boolean {
    return false;
  }

  private getLayer(layerID: number): Layer {
    if (this.image.layers.length === 0) {
      return this.image.layers[0] = new Layer(layerID);
    } else {
      for (const layer of this.image.layers) {
        if (layer.id === layerID) {
          return layer;
        }
      }
      return this.image.layers[this.image.layers.length - 1] = new Layer(layerID);
    }
  }

  private highLightLine(index: number) {
    DrawUtil.drawLineOnCanvas(this.cx, this.currentLayer.lines[index], 'yellow', 4);
  }

  private newLineOnCanvas(layer: Layer, currentPos: { x: number, y: number }) {
    layer.line.push({x: currentPos.x, y: currentPos.y});
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
}

