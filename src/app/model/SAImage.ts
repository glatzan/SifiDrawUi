import {SEntity} from "./SEntity";
import {Layer} from "./layer";

export abstract class SAImage extends SEntity {
  id: string;
  name: string;
  path: string;
  concurrencyCounter: number;
  hasLayerData: boolean;

  abstract getData(): string;

  abstract getLayers(): Layer[];

  abstract setLayers(layers: Layer[]);

  abstract getHeight();

  abstract getWidth();

  abstract getFileExtension();

  abstract hasData();

  abstract getImage();
}

