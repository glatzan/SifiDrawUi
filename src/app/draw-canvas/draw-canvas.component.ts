import {Component, OnInit, Input, ElementRef, AfterViewInit, ViewChild} from '@angular/core';
import {fromEvent} from 'rxjs';
import {switchMap, takeUntil, pairwise} from 'rxjs/operators';
import {Layer} from '../model/layer';
import VectorUtils from '../utils/vector-utils';
import {Point} from '../model/point';
import vector from '../utils/vector-utils';
import DrawUtil from '../utils/draw-util';
import {Dataset} from '../model/dataset';
import {DatasetService} from '../service/dataset.service';
import {ImageService} from '../service/image.service';
import {CImage} from '../model/image';

@Component({
  selector: 'app-draw-canvas',
  templateUrl: './draw-canvas.component.html',
  styleUrls: ['./draw-canvas.component.scss']
})

export class DrawCanvasComponent implements AfterViewInit {

  // a reference to the canvas element from our template
  @ViewChild('canvas', {static: false}) public canvas: ElementRef;

  private cx: CanvasRenderingContext2D;

  /**
   * Image Data from Backend
   */
  private image: CImage;

  private currentLayer = this.image.layers[0];

  private drawImage = new Image();

  public width = 1300;

  public height = 650;

  private rightClickCircleSize: number;

  private event: MouseEvent;

  private mousePressed = false;

  private mouseButton = 0;

  private lastPos: {
    x: number, y: number
  };

  constructor(public imageService: ImageService) {
    // draw on load
    this.drawImage.onload = () => {
      this.redrawUI();
    };
  }


  @Input()
  set selectedImage(selectedImageId: string) {
    if (selectedImageId !== undefined) {
      this.imageService.getImage(selectedImageId).subscribe((data: CImage) => {
        this.image = data;
        this.drawImage.src = 'data:image/png;base64,' + this.image.data;
      }, error1 => {
        console.log('Fehler beim laden der Dataset Datein');
        console.error(error1);
      });
    }
  }

  private redrawUI() {
    this.cx.drawImage(this.drawImage, 0, 0);
  }

  public ngAfterViewInit() {

    this.lastPos = {x: 0, y: 0};

    this.rightClickCircleSize = 15;

    // get the context
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;

    this.cx = canvasEl.getContext('2d');
    // set the width and height
    canvasEl.width = this.width;
    canvasEl.height = this.height;


    // set some default properties about the line
    this.cx.lineWidth = 1;
    this.cx.lineCap = 'round';
    this.cx.strokeStyle = '#fff';
    this.cx.fillStyle = '#ff0000';

  }

  public onMouseMove(event: MouseEvent) {
    console.log('move' + this.mouseButton);
    if (this.mousePressed) {

      const e = this.canvas.nativeElement.getBoundingClientRect();
      let mousePos = {x: event.clientX - e.left, y: event.clientY - e.top};

      if (this.mouseButton === 1) {
        this.drawOnCanvas(this.currentLayer, mousePos);
      } else if (this.mouseButton === 2) {
        this.onMouseMoveWithRightClick(event, mousePos);
      }
    }
  }

  /**
   * Mouse movement with right mouse button pressed
   * @param event
   */
  public onMouseMoveWithRightClick(event: MouseEvent, mousePos: Point) {

    this.redrawUI();
    DrawUtil.drawCircle(this.cx, mousePos, this.rightClickCircleSize);

    if (event.ctrlKey) {
      if (VectorUtils.removeCollidingPointListsOfCircle(this.currentLayer.lines, mousePos, this.rightClickCircleSize)) {
        DrawUtil.clearRect(this.cx, this.width, this.height);
        DrawUtil.redrawCanvas(this.cx, this.image.layers);
      }
    } else {
      if (VectorUtils.movePointListsToCircleBoundaries(this.currentLayer.lines, mousePos, this.rightClickCircleSize)) {
        DrawUtil.clearRect(this.cx, this.width, this.height);
        DrawUtil.redrawCanvas(this.cx, this.image.layers);
      }
    }

  }

  public addLayer(event) {
    this.image.layers.push(new Layer(this.image.layers.length + 1));
    this.currentLayer = this.image.layers[this.image.layers.length - 1];
  }

  public selectPoints(index: number) {
    this.currentLayer.line = this.currentLayer.lines[index];
  }

  public onMouseDown(event: MouseEvent) {
    console.log('down ' + event.buttons + ' e');
    this.mouseButton = event.buttons;
    this.mousePressed = true;

    if (event.ctrlKey && event.buttons === 1) {
      this.currentLayer.newLine();
    }

    this.onMouseMove(event);
  }

  public onMouseUp(event: MouseEvent) {
    console.log('up ' + event.buttons + ' e');
    this.mouseButton = 0;
    this.mousePressed = false;
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

  private clearCanvasOverlay() {
    DrawUtil.clearRect(this.cx, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
  }

  private redrawLines() {
    console.log('redraw');
    DrawUtil.clearRect(this.cx, this.width, this.height);
    DrawUtil.redrawCanvas(this.cx, this.image.layers);
  }


  private drawOnCanvas(layer: Layer, currentPos: { x: number, y: number }) {
    // incase the context is not set
    if (!this.cx) {
      return;
    }

    layer.line.push({x: currentPos.x, y: currentPos.y});

    if (layer.line.length <= 1) {
      return;
    }

    const lastPoint = layer.line[layer.line.length - 2];

    DrawUtil.drawSingleLineOnCanvas(this.cx, lastPoint, currentPos);

  }
}

