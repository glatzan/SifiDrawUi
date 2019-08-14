import {Component, OnInit, Input, ElementRef, AfterViewInit, ViewChild} from '@angular/core';
import {Layer} from '../model/layer';
import VectorUtils from '../utils/vector-utils';
import {Point} from '../model/point';
import DrawUtil from '../utils/draw-util';
import {ImageService} from '../service/image.service';
import {CImage} from '../model/cimage';
import CImageUtil from '../utils/cimage-util';
import {debounceTime} from 'rxjs/operators';

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

  private currentLayerId = 1;

  private currentLayer: Layer;

  private drawImage = new Image();

  public width = 1300;

  public height = 650;

  private rightClickCircleSize: number;

  private event: MouseEvent;

  private mousePressed = false;

  private mouseButton = 0;

  private renderContext = false;

  private currentSaveTimeout: any = undefined;

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

  private redrawUI() {
    this.cx.drawImage(this.drawImage, 0, 0);
    DrawUtil.redrawCanvas(this.cx, this.image.layers);
  }

  public ngAfterViewInit() {

    this.lastPos = {x: 0, y: 0};

    this.rightClickCircleSize = 40;

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
    if (!this.drawImage) {
      return;
    }

    console.log('move' + this.mouseButton);
    if (this.mousePressed) {
      const e = this.canvas.nativeElement.getBoundingClientRect();
      let mousePos = {x: event.clientX - e.left, y: event.clientY - e.top};

      if (this.mouseButton === 1) {
        this.newLineOnCanvas(this.currentLayer, mousePos);
        this.saveContent();
        this.redrawUI();
      } else if (this.mouseButton === 2) {
        this.onMouseMoveWithRightClick(event, mousePos);
      }
    }
  }

  /**
   * Mouse movement with right mouse button pressed
   */
  public onMouseMoveWithRightClick(event: MouseEvent, mousePos: Point) {

    if (event.ctrlKey) {
      if (VectorUtils.removeCollidingPointListsOfCircle(this.currentLayer.lines, mousePos, this.rightClickCircleSize)) {
        this.saveContent();
      }
    } else {
      if (VectorUtils.movePointListsToCircleBoundaries(this.currentLayer.lines, mousePos, this.rightClickCircleSize)) {
        this.saveContent();
      }
    }
    this.redrawUI();
    DrawUtil.drawCircle(this.cx, mousePos, this.rightClickCircleSize);
  }

  public addLayer(event) {
    this.image.layers = [...this.image.layers, (new Layer(this.image.layers.length + 1))];
    this.currentLayer = this.image.layers[this.image.layers.length - 1];
  }

  public selectPoints(index: number) {
    this.currentLayer.line = this.currentLayer.lines[index];
  }

  public onMouseDown(event: MouseEvent) {
    if (!this.drawImage) {
      return;
    }

    console.log('down ' + event.buttons + ' e');
    this.mouseButton = event.buttons;
    this.mousePressed = true;

    if (event.ctrlKey && event.buttons === 1) {
      CImageUtil.newLine(this.currentLayer);
    }

    this.onMouseMove(event);
  }

  public onMouseUp(event: MouseEvent) {
    if (!this.drawImage) {
      return;
    }

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
}

