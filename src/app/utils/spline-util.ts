import {CPolygon} from './cpolygon';

export class SplineUtil {
  public static computeSplineCurve(splinePoly: { x: number[], y: number[], size: number }, tension, closed) {

    // splinePoly: CPolygon = { X: array of number, Y: array of number, Size: integer }
    // splinePoly.Size defines the number of valid points in X, Y, ignoring further points.
    //
    // tension: number; curve parameter; 0.5 is a good value
    //
    // closed: boolean; true -> closed spline
    //
    // returns a new CPolygon of sequence: [ P0, C0b, C1a, P1, C1b, C2a, P2, C2b, C3a, P3, ... ]
    // where P0 and P1 are the endpoints and C0b and C1a are control points of the first bezier segment...
    // Note: the returned CPolygon.X.length may be greater than CPolygon.Size! Use only Size Points to draw!

    if (splinePoly.size <= 2) {
      return null;
    }

    // make bezier polygon in format: [ P0, C0b, C1a, P1, C1b, C2a, P2, C2b, C3a, P3, ... ]

    const bezierPoly = new CPolygon();
    bezierPoly.addPoint(splinePoly.x[0], splinePoly.y[0]);    // P0
    for (let i = 1; i < splinePoly.size; i++) {
      bezierPoly.addPoint(0, 0);                    // placeholder for C<i-1>b
      bezierPoly.addPoint(0, 0);                    // placeholder for C<i>a
      bezierPoly.addPoint(splinePoly.x[i], splinePoly.y[i]);  // P<i>
    }

    if (closed) {
      // closed spline: replicate first two points and add them to the end of bezierPoly

      bezierPoly.addPoint(0, 0);
      bezierPoly.addPoint(0, 0);
      bezierPoly.addPoint(splinePoly.x[0], splinePoly.y[0]);
      bezierPoly.addPoint(0, 0);
      bezierPoly.addPoint(0, 0);
      bezierPoly.addPoint(splinePoly.x[1], splinePoly.y[1]);

    } else {

      // open spline: set first and last bezier control point equal first and last spline point

      bezierPoly.x[1] = splinePoly.x[0];
      bezierPoly.y[1] = splinePoly.y[0];
      bezierPoly.x[bezierPoly.size - 2] = splinePoly.x[splinePoly.size - 1];
      bezierPoly.y[bezierPoly.size - 2] = splinePoly.y[splinePoly.size - 1];

    }

    // compute bezier control points C<i>a and C<i>b for i from 1 to lastPivot
    // [ P0 C0b C1a P1 C1b C2a P2 ... P7 C7b C8a P8 C8b C9a P9 ]
    //               ^----firstPivot              ^----lastPivot

    const lastPivot = closed ? splinePoly.size : splinePoly.size - 2;
    this.computeBezierControlPoints(bezierPoly, tension, lastPivot);

    // closed spline: copy control point Cb of second last extra point (P8) to
    // control point Cb of first point (P0) and cutoff last extra bezier segment
    //       v------------------------------+
    // [ P0 C0b C1a P1 ... P7 C7b C8a P8 | C8b C9a P9 ]

    if (closed) {
      const lastCP = bezierPoly.size - 3;
      bezierPoly.x[1] = bezierPoly.x[lastCP];
      bezierPoly.y[1] = bezierPoly.y[lastCP];
      bezierPoly.size -= 3;
    }

    return bezierPoly;
  }

  private static computeBezierControlPoints(poly: CPolygon, tension: number, lastPivot: number) {

    // Computes Control Points C<i>a and C<i>b for quadratic Bezier segments.
    // Each pair of Control Points C<i>a, C<i>b is computed from points P<i-1>, P<i>, P<i+1>.
    // P<i> is called a pivot point. i ranges from 1 to <lastPivot> inclusive.
    //
    // poly: CPolygon = { X: array of number, Y: array of number, Size: integer }
    // poly Point Sequence is:
    // [ P0, (C0b), C1a, P1, C1b, C2a, P2, C2b, C3a, P3, ..., P7 C7b C8a P8 C8b (C9a) C9 ]
    //    first Pivot-----^             ^----second Pivot                 ^----last Pivot
    //
    // Note: Control-Points in () can't be computed by this function.
    //
    // Note: places for control points C<i>a and C<i>b must already exist in poly.
    // lastPivot: index of last pivot point (not poly index but original spline point index).
    //
    // source Rob Spencer, July 2010: http://scaledinnovation.com/analytics/splines/aboutSplines.html
    // adapted by me (Walter Bislin) 2016: http://walter.bislins.ch/

    function LengthFor(side1, side2) {
      return Math.sqrt(side1 * side1 + side2 * side2);
    }

    let fa;
    let fb;
    const px = poly.x;
    const py = poly.y;
    for (let i = 1; i <= lastPivot; i++) {
      const pivot = 3 * i;
      const left = pivot - 3;
      const right = pivot + 3;
      const ca = pivot - 1;
      const cb = pivot + 1;
      const d01 = LengthFor(px[pivot] - px[left], py[pivot] - py[left]);
      const d12 = LengthFor(px[right] - px[pivot], py[right] - py[pivot]);
      const d = d01 + d12;
      if (d > 0) {
        fa = tension * d01 / d;
        fb = tension * d12 / d;
      } else {
        // note: d01 and d12 are also 0, so we are save if we set fa = fb = 0
        fa = 0;
        fb = 0;
      }
      const w = px[right] - px[left];
      const h = py[right] - py[left];
      px[ca] = px[pivot] - fa * w;
      py[ca] = py[pivot] - fa * h;
      px[cb] = px[pivot] + fb * w;
      py[cb] = py[pivot] + fb * h;
    }
  }
}
