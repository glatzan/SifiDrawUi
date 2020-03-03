import {Point} from './point';
import {LayerType} from "./layer-type.enum";
import {flatMap, map} from "rxjs/operators";
import {ICImage} from "./ICImage";
import {FilterData} from "../worker/filter-data";

export class Layer {
  id: string;
  name: string;
  lines: Point[][];
  line: Point[];

  size: number = 1;
  color: string = '#ffffff';

  type: number;

  constructor(id: string)
  constructor(id: string, points?: Point[][])
  constructor(id: string, points?: Point[][], name?: string) {
    this.id = id;
    this.lines = points || [];
    this.line = points && points[(points.length - 1)];
    this.name = name || id

    if (!points) {
      this.lines.push([]);
      this.line = this.lines[this.lines.length - 1];
    }

    this.type = LayerType.Line;
  }



}
