import {Layer} from './layer';

export class CImage {
  public id: string;
  public name: string;
  public data: string;
  public layers: Layer[] = Layer[1];
}
