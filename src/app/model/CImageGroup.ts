import {CImage} from './CImage';
import {ICImage} from './ICImage';
import {Layer} from "./layer";

export class CImageGroup implements ICImage {
  public id: string;
  public name: string;
  public images: CImage[];
  public type = 'group';

  public activeImage = 0;

  public getData(): string {
    if (this.activeImage >= 0 && this.activeImage < this.images.length) {
      return this.images[this.activeImage].data;
    } else {
      return '';
    }
  }

  public getLayers(): Layer[] {
    if (this.activeImage >= 0 && this.activeImage < this.images.length) {
      return this.images[this.activeImage].layers;
    } else {
      return [];
    }
  }

  public setLayers(layers: Layer[]) {
    if (this.activeImage >= 0 && this.activeImage < this.images.length) {
      this.images[this.activeImage].layers = layers;
    }
  }

}
