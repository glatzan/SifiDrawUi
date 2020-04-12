import {Layer} from "./layer";

export interface SAImage {
  id: string;
  name: string;
  type: string;
  path: string;
  concurrencyCounter: number;
  hasLayerData: boolean

  getData(): string;

  getLayers(): Layer[];

  setLayers(layers: Layer[]);

  getHeight();

  getWidth();

  getFileExtension();

  hasData();

  getImage();
}
