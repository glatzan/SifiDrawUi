import {Component, OnInit, Input, ElementRef, AfterViewInit, ViewChild} from '@angular/core';
import {fromEvent} from 'rxjs';
import {switchMap, takeUntil, pairwise} from 'rxjs/operators';
import {Layer} from '../model/layer';
import VectorUtils from "../utils/vector-utils";
import {Point} from "../model/point";
import vector from "../utils/vector-utils";
import DrawUtil from "../utils/draw-util";

@Component({
  selector: 'app-draw-canvas',
  templateUrl: './draw-canvas.component.html',
  styleUrls: ['./draw-canvas.component.scss']
})

export class DrawCanvasComponent implements AfterViewInit {


  // imageObj = new Image();
  // imageName = '../../assets/92959.jpg';

  constructor() {
  }

  // a reference to the canvas element from our template
  @ViewChild('canvas', {static: false}) public canvas: ElementRef;
  // a reference to the canvas element from our template
  @ViewChild('canvas2', {static: false}) public canvas2: ElementRef;
  // a reference to the canvas element from our template
  @ViewChild('container', {static: false}) public divContainer: ElementRef;

  // setting a width and height for the canvas
  @Input() public width = 1300;
  @Input() public height = 650;

  private outerStyle = "position: relative; height: " + this.height + " px";
  private cx: CanvasRenderingContext2D;
  private cx2: CanvasRenderingContext2D;

  private event: MouseEvent;

  private mousePressed = false;
  private mouseButton = 0;

  private layers: Layer[] = [new Layer(1)];
  private currentLayer = this.layers[0];

  private lastPos: {
    x: number, y: number
  }

  private rightClickCircleSize: number;

  ngOnInit() {
    this.lastPos = {x: 0, y: 0};
    this.rightClickCircleSize = 15;
  }

  public ngAfterViewInit() {


    // get the context
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    const canvasE2: HTMLCanvasElement = this.canvas2.nativeElement;

    this.cx = canvasEl.getContext('2d');
    this.cx2 = canvasE2.getContext('2d');
    // set the width and height
    canvasEl.width = this.width;
    canvasEl.height = this.height;
    canvasE2.width = this.width;
    canvasE2.height = this.height;

    this.divContainer.nativeElement.height = this.height;

    // set some default properties about the line
    this.cx.lineWidth = 1;
    this.cx.lineCap = 'round';
    this.cx.strokeStyle = '#fff';
    this.cx.fillStyle = "#ff0000";

    this.cx2.lineWidth = 1;
    this.cx2.lineCap = 'round';
    this.cx2.strokeStyle = '#fff';
    canvasEl
  }

  public onMouseMove(event: MouseEvent) {
    console.log("move" + this.mouseButton)
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

    DrawUtil.clearRect(this.cx2, this.width, this.height);
    DrawUtil.drawCircle(this.cx2, mousePos, this.rightClickCircleSize);

    if (event.ctrlKey) {
      if (VectorUtils.removeCollidingPointListsOfCircle(this.currentLayer.lines, mousePos, this.rightClickCircleSize)) {
        DrawUtil.clearRect(this.cx, this.width, this.height);
        DrawUtil.redrawCanvas(this.cx, this.layers);
      }
    } else {
      if (VectorUtils.movePointListsToCircleBoundaries(this.currentLayer.lines, mousePos, this.rightClickCircleSize)) {
        DrawUtil.clearRect(this.cx, this.width, this.height);
        DrawUtil.redrawCanvas(this.cx, this.layers);
      }
    }

  }

  public addLayer(event) {
    this.layers.push(new Layer(this.layers.length + 1));
    this.currentLayer = this.layers[this.layers.length - 1];
  }

  public selectPoints(index: number) {
    this.currentLayer.line = this.currentLayer.lines[index];
  }

  public onMouseDown(event: MouseEvent) {
    console.log("down " + event.buttons + " e")
    this.mouseButton = event.buttons;
    this.mousePressed = true;

    if (event.ctrlKey && event.buttons === 1) {
      this.currentLayer.newLine();
    }

    this.onMouseMove(event);
  }

  public onMouseUp(event: MouseEvent) {
    console.log("up " + event.buttons + " e")
    this.mouseButton = 0;
    this.mousePressed = false;
  }

  public onEvent(event: MouseEvent): boolean {
    return false;
  }

  private getLayer(layerID: number): Layer {
    if (this.layers.length === 0) {
      return this.layers[0] = new Layer(layerID);
    } else {
      for (const layer of this.layers) {
        if (layer.id === layerID) {
          return layer;
        }
      }
      return this.layers[this.layers.length - 1] = new Layer(layerID);
    }
  }

  private highLightLine(index: number) {
    DrawUtil.drawLineOnCanvas(this.cx2, this.currentLayer.lines[index], "yellow", 4)
  }

  private clearCanvasOverlay() {
    DrawUtil.clearRect(this.cx2, this.canvas2.nativeElement.width, this.canvas2.nativeElement.height)
  }

  private redrawLines() {
    console.log("redraw")
    DrawUtil.clearRect(this.cx, this.width, this.height)
    DrawUtil.redrawCanvas(this.cx, this.layers);
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

