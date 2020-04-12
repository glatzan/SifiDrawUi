import {Layer} from './layer';
import {SAImage} from './SAImage';

export class SImage implements SAImage {
  id: string;
  name: string;
  path: string;
  data: string;
  layers: Layer[] = [];
  width: number;
  height: number;
  fileExtension: string;
  concurrencyCounter: number = 0;
  hasLayerData: boolean;

  public type = 'img';

  public getData(): string {
    return this.data;
  }

  public getLayers(): Layer[] {
    return this.layers;
  }

  public setLayers(layers: Layer[]) {
    this.layers = layers;
  }

  public getHeight() {
    return this.height;
  }

  public getWidth() {
    return this.width;
  }

  public getFileExtension() {
    return this.fileExtension;
  }

  public hasData() {
    return this.data != null && this.data.length > 0
  }

  public getImage() {
    return this;
  }

}
