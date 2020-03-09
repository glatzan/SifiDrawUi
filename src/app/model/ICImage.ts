import {Layer} from "./layer";

export interface ICImage {
  id: string;
  name: string;
  type: string;
  concurrencyCounter: number;

  getData(): string;

  getLayers(): Layer[];

  setLayers(layers: Layer[]);

  getHeight();

  getWidth();

  getFileExtension();

  hasData();

  getImage();
}
