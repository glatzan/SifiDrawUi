export class Vector {
  x: number;
  y: number;
  pos: number;

  constructor(x: number, y: number)
  constructor(x: number, y: number, pos: number)
  constructor(x = 0, y = 0, pos?: number) {
    this.x = x;
    this.y = y;
    this.pos = pos;
  }
}
