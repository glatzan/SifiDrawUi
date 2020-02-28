import {CImage} from './CImage';
import {ICImage} from './ICImage';

export class CImageGroup implements ICImage {
  public id: string;
  public name: string;
  public images: CImage[];
  public type = 'group';
}
