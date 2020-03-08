import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Layer} from '../../../model/layer';
import VectorUtils from '../../../utils/vector-utils';
import {Point} from '../../../model/point';
import DrawUtil from '../../../utils/draw-util';
import {ImageService} from '../../../service/image.service';
import CImageUtil from '../../../utils/cimage-util';
import {PointTracker} from '../../../utils/point-tracker';
import {MatSnackBar} from '@angular/material';
import {WorkViewService} from '../work-view.service';
import {ICImage} from '../../../model/ICImage';
import {MousePosition} from "../../../helpers/mouse-position";
import {LayerType} from "../../../model/layer-type.enum";
import {CanvasDisplaySettings, CanvasDrawMode} from "../../../helpers/canvas-display-settings";
import {FlickerService} from "../flicker.service";
import {CImageGroup} from "../../../model/CImageGroup";
import {AuthenticationService} from "../../../service/authentication.service";

@Component({
  selector: 'app-draw-canvas',
  templateUrl: './draw-canvas.component.html',
  styleUrls: ['./draw-canvas.component.scss']
})

export class DrawCanvasComponent implements AfterViewInit, OnInit {

  // a reference to the canvas element from our template
  @ViewChild('canvas', {static: false}) public canvas: ElementRef;

  /**
   * Image Data from Backend, display image
   */
  private image: ICImage;

  /**
   * Current layer
   */
  private currentLayer: Layer;

  /**
   * Base64 to Image Converter
   */
  private drawImage = new Image();

  readonly MOUSE_LEFT_BTN = 0;

  readonly MOUSE_RIGHT_BTN = 2;

  private cx;

  private pointTracker: PointTracker;

  private event: MouseEvent;

  private displaySettings: CanvasDisplaySettings;
  /**
   * Scalefactor for zooming, constant
   */
  private scaleFactor = 1.05;

  /**
   * Current canvasZoom rounded for ui
   */
  private currentZoomRounded = 100;



  // last point of the mouse
  private lastMousePoint = new MousePosition();

  /**
   * Settings for image
   */
  private imageSettings = {
    // start position for canvas drag
    dragStartPos: null,
    // true if the canvas is dragged
    dragged: false,
    // true if alt btn was pressed while the mouse was clicked
    btnAlt: false,
    // true if ctrl btn was pressed while the mouse was clicked
    btnCtrl: false,
    // true if the mouse was clicked
    mouseClicked: false,
    // number of the mouse btn
    mouseBtn: -1,
    // current canvas zoom
    currentZoom: 100,
    // true if key input is accepted
    acceptKeyInput: false,
    setLastPoint: (evt) => {
      this.lastMousePoint.x = evt.offsetX || (evt.pageX - this.canvas.nativeElement.offsetLeft);
      this.lastMousePoint.y = evt.offsetY || (evt.pageY - this.canvas.nativeElement.offsetTop);
      this.lastMousePoint.color = this.cx.getImageData(this.lastMousePoint.x, this.lastMousePoint.y, 1, 1).data;
      this.workViewService.onMouseCoordinatesCanvasChanged.emit(this.lastMousePoint);
    },
    zoomFunction: (clicks) => {
      const pt = this.cx.transformedPoint(this.lastMousePoint.x, this.lastMousePoint.y);
      this.cx.translate(pt.x, pt.y);
      const factor = Math.pow(this.scaleFactor, clicks);
      this.imageSettings.currentZoom = this.imageSettings.currentZoom * factor;
      this.currentZoomRounded = Math.round(this.imageSettings.currentZoom);
      this.cx.scale(factor, factor);
      this.cx.translate(-pt.x, -pt.y);
      this.canvasRedraw();
    },
    scroll: ($event) => {
      console.log('scroll');
      const delta = $event.wheelDelta ? $event.wheelDelta / 40 : $event.detail ? -$event.detail : 0;
      if (this.imageSettings.mouseClicked && this.imageSettings.mouseBtn === this.MOUSE_RIGHT_BTN) {
        if (delta > 0) {
          this.displaySettings.eraserSize = this.displaySettings.eraserSize + 2;
        } else {
          this.displaySettings.eraserSize = this.displaySettings.eraserSize - 2;
        }
        const pt = this.cx.transformedPoint(this.lastMousePoint.x, this.lastMousePoint.y);
        this.canvasRedraw();
        DrawUtil.drawCircle(this.cx, new Point(pt.x, pt.y), this.displaySettings.eraserSize);
      } else {
        if (delta) {
          this.imageSettings.zoomFunction(delta);
        }
      }
      return $event.preventDefault() && false;
    },
    mouseDownListener: (evt) => {
      this.imageSettings.setLastPoint(evt);
      this.imageSettings.btnAlt = evt.altKey;
      this.imageSettings.btnCtrl = evt.ctrlKey;
      this.imageSettings.mouseClicked = true;
      this.imageSettings.mouseBtn = evt.button;

      console.log('Mouse clicked');

      // dragging or zooming via click
      if (this.imageSettings.btnAlt) {
        this.imageSettings.btnAlt = true;
        this.imageSettings.dragged = false;
        this.imageSettings.dragStartPos = this.cx.transformedPoint(this.lastMousePoint.x, this.lastMousePoint.y);
        // alternate mode
      } else if (this.imageSettings.btnCtrl) {
        if (this.imageSettings.mouseBtn === this.MOUSE_LEFT_BTN) {
          CImageUtil.addLine(this.currentLayer);
        }
      } else {
        if (this.imageSettings.mouseBtn === this.MOUSE_LEFT_BTN) {
          const pt = this.cx.transformedPoint(this.lastMousePoint.x, this.lastMousePoint.y);
          CImageUtil.addPointToCurrentLine(this.currentLayer, pt.x, pt.y);
          this.workViewService.saveContent();
          this.canvasRedraw();
        }
      }
    },
    mouseMoveListener: (evt) => {
      this.imageSettings.setLastPoint(evt);

      if (this.imageSettings.mouseClicked) {
        // move
        if (this.imageSettings.btnAlt) {
          if (this.imageSettings.dragStartPos === null) {
            return;
          }
          this.imageSettings.dragged = true;
          const pt = this.cx.transformedPoint(this.lastMousePoint.x, this.lastMousePoint.y);
          this.cx.translate(pt.x - this.imageSettings.dragStartPos.x, pt.y - this.imageSettings.dragStartPos.y);
          this.canvasRedraw();
        } else {
          console.log(this.imageSettings.mouseBtn);
          const pt = this.cx.transformedPoint(this.lastMousePoint.x, this.lastMousePoint.y);
          // draw
          switch (this.imageSettings.mouseBtn) {
            case this.MOUSE_LEFT_BTN:
              if (this.displaySettings.drawMode == CanvasDrawMode.LineMode && this.currentLayer.type != LayerType.Dot) {
                CImageUtil.addPointToCurrentLine(this.currentLayer, pt.x, pt.y);
                this.workViewService.saveContent();
                this.canvasRedraw();
              }
              break;
            case this.MOUSE_RIGHT_BTN:
              // check ctrl key again, for better editing
              if (evt.ctrlKey) {
                if (VectorUtils.removeCollidingPointListsOfCircle(this.currentLayer.lines, new Point(pt.x, pt.y), this.displaySettings.eraserSize)) {
                  this.workViewService.saveContent();
                }
              } else {
                if (VectorUtils.movePointListsToCircleBoundaries(this.currentLayer.lines, new Point(pt.x, pt.y), this.displaySettings.eraserSize, this.currentLayer.type !== LayerType.Dot)) {
                  this.workViewService.saveContent();
                }
              }
              this.canvasRedraw();
              DrawUtil.drawCircle(this.cx, new Point(pt.x, pt.y), this.displaySettings.eraserSize);
              break;
          }
        }
      }
    },
    mouseUpListener: (evt) => {
      this.imageSettings.mouseClicked = false;

      // zooming on click
      if (this.imageSettings.btnAlt && !this.imageSettings.dragged) {
        this.imageSettings.zoomFunction(this.imageSettings.btnCtrl ? -1 : 1);
      }

    }
  };

  constructor(public imageService: ImageService,
              private snackBar: MatSnackBar,
              private workViewService: WorkViewService,
              private flickerService: FlickerService,
              private authenticationService: AuthenticationService) {
    // draw on load
    this.drawImage.onload = () => {
      this.drawImageOnCanvas();
      // checking after image is drawn, before layers are drawn
      this.drawLayersOnCanvas();
    };
  }

  /**
   * Event for loading a new Image
   */
  ngOnInit() {

    this.displaySettings = this.workViewService.getDisplaySettings();

    this.workViewService.onChangedParentImage.subscribe(image => {
      this.prepareImage(image);
    });

    this.workViewService.onChangedActiveImage.subscribe(image => {
      this.prepareImage(image);
    });

    this.workViewService.onDisplayImageRedraw.subscribe(x => {
      this.canvasRedraw();
    });

    this.workViewService.onLayerChange.subscribe(x => {
      this.currentLayer = x;
    });

    this.workViewService.onResetCanvasZoom.subscribe(x => {
      this.canvasResetZoom();
    });

    this.workViewService.highlightLineOfLayer.subscribe(x => {
      if (x === null) {
        this.canvasRedraw();
      } else {
        DrawUtil.drawPolygon(this.cx, x, 4, 'yellow');
      }
    });

    this.workViewService.onDisplaySettingsChanged.subscribe(x => {
      this.setMouseListeners(this.displaySettings.enableDrawing);
      this.canvasRedraw();
    });
  }

  public ngAfterViewInit() {
    this.cx = this.canvas.nativeElement.getContext('2d');
    this.initializeCanvas();
  }

  private initializeCanvas() {
    const me = this;
    this.cx = this.canvas.nativeElement.getContext('2d');
    this.pointTracker = new PointTracker(this.cx);

    this.canvas.nativeElement.addEventListener('DOMMouseScroll', this.imageSettings.scroll, false);
    this.canvas.nativeElement.addEventListener('mousewheel', this.imageSettings.scroll, false);

    this.canvas.nativeElement.addEventListener('mouseenter', ($event) => {
      me.imageSettings.acceptKeyInput = true;
    });

    this.canvas.nativeElement.addEventListener('mouseleave', ($event) => {
      me.imageSettings.acceptKeyInput = false;
    });

    window.addEventListener('keydown', ($event) => {
      if (me.image && me.imageSettings.acceptKeyInput) {
        this.workViewService.onKeyPressedOverCanvas.emit({key: $event.key, mousePosition: this.lastMousePoint})
        if ($event.key === ' ' || $event.key === 'ArrowDown') {
          // next image
          this.workViewService.nextSelectImageInDataset.emit();

        } else if ($event.key === 'ArrowUp') {
          // previouse image
          this.workViewService.prevSelectImageInDataset.emit();
        } else if (!isNaN(Number($event.key))) {
          const layer = CImageUtil.findOrAddLayer(this.image, $event.key, this.authenticationService.currentUserSettingsValue.defaultLayerSettings);
          this.currentLayer= layer;
          this.snackBar.open(`Layer ${layer.id} ausgewählt`);
        } else if ($event.key === 'h') {
          this.displaySettings.displayLayer = !this.displaySettings.displayLayer
          this.snackBar.open(`Linien ${this.displaySettings.displayLayer ? 'angezeigt' : 'ausgeblendet'}`);
          this.canvasRedraw();
        } else if ($event.key === 'r') {
          this.canvasResetZoom();
        } else if ($event.key === 't') {
          this.flickerService.toggleImage();
        } else {
          console.log($event.key);
        }

        $event.preventDefault();
        $event.stopPropagation();
      }
    }, false);

    this.setMouseListeners(this.displaySettings.enableDrawing);
  }

  private setMouseListeners(setListeners: boolean) {
    if (setListeners) {
      this.canvas.nativeElement.addEventListener('mousedown', this.imageSettings.mouseDownListener, false);
      this.canvas.nativeElement.addEventListener('mousemove', this.imageSettings.mouseMoveListener, false);
      this.canvas.nativeElement.addEventListener('mouseup', this.imageSettings.mouseUpListener, false);
    } else {
      this.canvas.nativeElement.removeEventListener('mousedown', this.imageSettings.mouseDownListener);
      this.canvas.nativeElement.removeEventListener('mousemove', this.imageSettings.mouseMoveListener);
      this.canvas.nativeElement.removeEventListener('mouseup', this.imageSettings.mouseUpListener);
    }
  }

  /**
   * Redraws the canvas
   */
  private canvasRedraw() {
    this.drawImageOnCanvas();
    this.drawLayersOnCanvas();
  }

  private drawImageOnCanvas() {
    this.clearCanvas();
    this.cx.drawImage(this.drawImage, 0, 0);
  }

  private drawLayersOnCanvas() {
    if (this.displaySettings.displayLayer) {
      DrawUtil.redrawCanvas(this.cx, this.image.getLayers());
    }
  }

  private prepareImage(image: ICImage) {
    // save manually if image should be changed
    this.image = image;
    this.currentLayer = new Layer('-');

    if (image.hasData()) {
      this.drawImage.src = `data:image/${image.getFileExtension()};base64,` + this.image.getData();

      // setting layer settings
      this.cx.lineWidth = image.getLayers()[0].size || 1;
      this.cx.lineCap = 'round';
      this.cx.strokeStyle = image.getLayers()[0].color || '#fff';
      this.cx.fillStyle = image.getLayers()[0].color || '#fff';

      if (this.displaySettings.enableDrawingSliderDisabled) {
        this.displaySettings.enableDrawing = this.displaySettings.oldStatusEnableDrawing;
        this.displaySettings.enableDrawingSliderDisabled = false;
      }

    } else {
      if (image instanceof CImageGroup)
        this.drawImage.src = "assets/emptyImageGroup.jpg";
      else
        this.drawImage.src = "assets/selectImage.jpg";
      this.displaySettings.oldStatusEnableDrawing = this.displaySettings.enableDrawing;
      this.displaySettings.enableDrawing = false;
      this.displaySettings.enableDrawingSliderDisabled = true;
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

  public onEvent(event: MouseEvent): boolean {
    return false;
  }
}

