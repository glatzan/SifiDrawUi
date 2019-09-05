import {Point} from '../model/point';

export class PointTracker {

  private readonly svg;
  private form;
  private readonly cx;
  private readonly savedTransforms = [];

  constructor(cx: CanvasRenderingContext2D) {
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.form = this.svg.createSVGMatrix();
    this.cx = cx;
    this.savedTransforms = [];

    const me = this;

    this.cx.getTransform = () => {
      return me;
    };

    const save = this.cx.save;
    this.cx.save = () => {
      me.savedTransforms.push(me.form.translate(0, 0));
      return save.call(me.cx);
    };

    const restore = this.cx.restore;
    this.cx.restore = () => {
      me.form = me.savedTransforms.pop();
      return restore.call(me.cx);
    };

    const scale = this.cx.scale;
    this.cx.scale = (sx, sy) => {
      me.form = me.form.scaleNonUniform(sx, sy);
      return scale.call(me.cx, sx, sy);
    };

    const rotate = this.cx.rotate;
    this.cx.rotate = (radians) => {
      me.form = me.form.rotate(radians * 180 / Math.PI);
      return rotate.call(me.cx, radians);
    };

    const translate = this.cx.translate;
    this.cx.translate = (dx, dy) => {
      me.form = me.form.translate(dx, dy);
      return translate.call(me.cx, dx, dy);
    };

    this.cx.translatePoint = (p: Point) => {
      me.form = me.form.translate(p.x, p.y);
      return translate.call(me.cx, p.x, p.y);
    };

    const transform = this.cx.transform;
    this.cx.transform = (a, b, c, d, e, f) => {
      const m2 = me.svg.createSVGMatrix();
      m2.a = a;
      m2.b = b;
      m2.c = c;
      m2.d = d;
      m2.e = e;
      m2.f = f;
      me.form = me.form.multiply(m2);
      return transform.call(this.cx, a, b, c, d, e, f);
    };

    const setTransform = this.cx.setTransform;
    this.cx.setTransform = (a, b, c, d, e, f) => {
      me.form.a = a;
      me.form.b = b;
      me.form.c = c;
      me.form.d = d;
      me.form.e = e;
      me.form.f = f;
      return setTransform.call(me.cx, a, b, c, d, e, f);
    };

    const pt = this.svg.createSVGPoint();
    this.cx.transformedPoint = (p: Point) => {
      pt.x = p.x;
      pt.y = p.y;
      pt.matrixTransform(me.form.inverse());
      return new Point(pt.x, pt.y);
    };

  }

}
