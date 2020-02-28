import {Layer} from './layer';
import {ICImage} from "./ICImage";

export class CImage implements ICImage{
  public id: string;
  public name: string;
  public data: string;
  public layers: Layer[] = Layer[1];
  public type = 'img';
}
