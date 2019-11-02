import {Vector} from "./vector";

export interface Line {

  id: string;
  length: number;

  getFirstPoint(): Vector;

  getLastPoint(): Vector;

  reverse();

  hasPoints(): boolean;

  getPoints(): Vector[];

  getDirectionVector(): Vector;
}
