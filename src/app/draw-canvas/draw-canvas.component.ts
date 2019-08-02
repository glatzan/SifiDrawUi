import {Component, OnInit, Input, ElementRef, AfterViewInit, ViewChild} from '@angular/core';
import {fromEvent} from 'rxjs';
import {switchMap, takeUntil, pairwise} from 'rxjs/operators';
import {Layer} from '../model/layer';

@Component({
  selector: 'app-draw-canvas',
  templateUrl: './draw-canvas.component.html',
  styleUrls: ['./draw-canvas.component.css']
})

export class DrawCanvasComponent implements AfterViewInit {

  imageObj = new Image();
  imageName = '../../assets/92959.jpg';

  constructor() {
  }

  // a reference to the canvas element from our template
  @ViewChild('canvas', {static: false}) public canvas: ElementRef;
  // a reference to the canvas element from our template
  @ViewChild('canvas2', {static: false}) public canvas2: ElementRef;

  // setting a width and height for the canvas
  @Input() public width = 1300;
  @Input() public height = 650;

  private cx: CanvasRenderingContext2D;
  private cx2: CanvasRenderingContext2D;

  private event: MouseEvent;

  private mousePressed = false;
  private mouseButton = 0;

  private layers: Layer[];
  private currentLayer: Layer;

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

    // set some default properties about the line
    this.cx.lineWidth = 1;
    this.cx.lineCap = 'round';
    this.cx.strokeStyle = '#fff';

    this.cx2.lineWidth = 1;
    this.cx2.lineCap = 'round';
    this.cx2.strokeStyle = '#fff';

    this.imageObj.onload = () => {
      this.draw();
    };
    this.imageObj.src = this.imageName;

    this.layers = [];

    // we'll implement this method to start capturing mouse events
    this.captureEvents(canvasE2);
  }


  public onMouseMove(event: MouseEvent) {
    if (this.mousePressed) {

      if (event.ctrlKey) {
        this.currentLayer.newLine();
      }

      console.log(this.mouseButton);
      if (this.mouseButton === 1) {
        this.drawOnCanvas(this.currentLayer, {x: event.clientX, y: event.clientY});
      } else if (this.mouseButton === 2) {
        this.drawCircle({x: event.clientX, y: event.clientY}, {x: event.client + event.movementX, y: event.clientY + event.movementY});
      }
    }
  }


  public onMouseDown(event: MouseEvent) {
    this.currentLayer = this.getLayer(1);
    this.mouseButton = event.buttons;
    this.mousePressed = true;

    this.onMouseMove(event);
  }

  public onMouseUp(event: MouseEvent) {
    this.currentLayer = null;
    this.mouseButton = 0;
    this.mousePressed = false;
  }

  public onEvent(event: MouseEvent): void {
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

  private drawCircle(currentPos: { x: number, y: number }, lastPos: { x: number, y: number }) {
    this.cx2.beginPath();
    this.cx2.clearRect(lastPos.x - 26, lastPos.y - 26, 52, 52);
    this.cx2.arc(currentPos.x, currentPos.y, 25, 0, 2 * Math.PI);
    this.cx2.stroke();
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

    // start our drawing path
    this.cx.beginPath();

    // sets the start point
    this.cx.moveTo(lastPoint.x, lastPoint.y); // from

    // draws a line from the start pos until the current position
    this.cx.lineTo(currentPos.x, currentPos.y);

    // strokes the current path with the styles we set earlier
    this.cx.stroke();
  }

  public draw() {
    // clear canvas
    this.cx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    this.cx.drawImage(this.imageObj, 0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
  }

// .pipe(
//     switchMap((e) => {
//   // after a mouse down, we'll record all mouse moves
//   return fromEvent(canvasEl, 'mousemove')
// .pipe(
//     // we'll stop (and unsubscribe) once the user releases the mouse
//     // this will trigger a 'mouseup' event
//     takeUntil(fromEvent(canvasEl, 'mouseup')),
//   // we'll also stop (and unsubscribe) once the mouse leaves the canvas (mouseleave event)
//   takeUntil(fromEvent(canvasEl, 'mouseleave')),
//   // pairwise lets us get the previous value to draw a line from
//   // the previous point to the current point
//   pairwise()
// );
// })
  private captureEvents(canvasEl: HTMLCanvasElement) {

    // fromEvent(canvasEl, 'mousedown').subscribe( x => console.log('mouse down'));
    // fromEvent(canvasEl, 'mouseup').subscribe( x => console.log('mouse up'));
    // // this will capture all mousedown events from the canvas element
    // fromEvent(canvasEl, 'mousemove').pipe(pairwise()).subscribe((res: [MouseEvent, MouseEvent]) => {
    //     const rect = canvasEl.getBoundingClientRect();
    //
    //     res[1].preventDefault();
    //
    //     const button = res[1].buttons;
    //
    //     if (1 === button) {
    //       // previous and current position with the offset
    //       const prevPos = {
    //         x: res[0].clientX - rect.left,
    //         y: res[0].clientY - rect.top
    //       };
    //
    //       const currentPos = {
    //         x: res[1].clientX - rect.left,
    //         y: res[1].clientY - rect.top
    //       };
    //
    //
    //       // this method we'll implement soon to do the actual drawing
    //       this.drawOnCanvas(prevPos, currentPos);
    //     } else if (2 === button) {
    //       this.cx2.beginPath();
    //       this.cx2.clearRect(res[0].clientX - rect.left - 26, res[0].clientY - rect.top - 26, 52, 52)
    //       this.cx2.arc(res[1].clientX - rect.left, res[1].clientY - rect.top, 25, 0, 2 * Math.PI);
    //       this.cx2.stroke();
    //     }
    //   });
  }


}

