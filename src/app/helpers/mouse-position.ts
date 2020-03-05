export class MousePosition {
  x: number;
  y: number;
  color: number[];

  clear() {
    this.x = 0;
    this.y = 0;
    this.color = [];
  }
}
