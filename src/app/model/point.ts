export class Point {
  x: number;
  y: number;
  pos: number;
  id: number;

  constructor(x: number, y: number)
  constructor(x: number, y: number, pos: number)
  constructor(x: number, y: number, pos: number, id: number)
  constructor(x = 0, y = 0, pos?: number, id?: number) {
    this.x = x;
    this.y = y;
    this.pos = pos;
    this.id = id;
  }
}
