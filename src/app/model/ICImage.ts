import {Layer} from "./layer";

export interface ICImage {
  id: string;
  name: string;
  type: string;

  getData(): string;

  getLayers(): Layer[];

  setLayers(layers: Layer[]);
}
