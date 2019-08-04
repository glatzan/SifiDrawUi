import {Point} from "../model/point";

export default class VectorUtils {

  static distance(p1: Point, p2: Point): number {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  }

  static directionVector(p1: Point, p2: Point): Point {
    const px = p1.x - p2.x;
    const py = p1.y - p2.y;
    return {x: px, y: py};
  }

  static calculateNewPoint(p1: Point, p2: Point, targetLength: number, dirVec?: Point): Point {
    const dist = VectorUtils.distance(p1, p2);
    if (dist < targetLength) {
      const dirVect = !dirVec ? VectorUtils.directionVector(p1, p2) : dirVec;
      const f = 1 - dist / targetLength;
      return {
        x: Math.round(p2.x - dirVect.x * f), y: Math.round(p2.y - dirVect.y * f)
      };
    }
    return null;
  }

  static calculatePoint(p1: Point, dirVec: Point, offset: number): Point {
    return {x: Math.round(p1.x - dirVec.x * offset), y: Math.round(p1.y - dirVec.y * offset)};
  }

  static removeCollidingPointListsOfCircle(poinst: Point[][], origin: Point, radius: number): boolean {
    let removed = false;
    poinst.forEach((x, index) => {
      removed = removed || VectorUtils.removeCollidingPointsOfCircle(x, origin, radius);
    })
    return removed;
  }

  static removeCollidingPointsOfCircle(poinst: Point[], origin: Point, radius: number): boolean {
    let removed = false;
    poinst.forEach((x, index) => {
      if (this.distance(x, origin) < radius) {
        poinst.splice(index, 1)
        removed = true;
      }
    })

    return removed;
  }

  static movePointListsToCircleBoundaries(points: Point[][], origin: Point, radius: number): boolean {
    let changed = false
    for (let i = 0; i < points.length; i++) {
      let result = this.movePointsToCircleBoundaries(points[i], origin, radius)

      if (result != null && result.length > 0) {
        VectorUtils.updatePoints(points[i], result)
        changed = true;
      }
    }

    return changed;
  }

  static movePointsToCircleBoundaries(points: Point[], origin: Point, radius: number): { index: number, point: Point }[] {
    let movedPoints: { index: number, point: Point }[] = []
    points.forEach((x, index, object) => {
      const res = VectorUtils.calculateNewPoint(origin, x, radius);
      if (res != null) {
        object[index] = res;
        movedPoints.push({index: index, point: res});
      }
    })

    return movedPoints;
  }

  static updatePoints(points: Point[], movedPoints: { index: number, point: Point }[]): boolean {
    let sections: { start: number, end: number }[] = [{start: movedPoints[0].index, end: movedPoints[0].index}];
    let currentIndex = 0;


    for (let i = 1; i < movedPoints.length; i++) {
      if ((sections[currentIndex].end + 1) === movedPoints[i].index) {
        sections[currentIndex].end = movedPoints[i].index;
      } else {
        currentIndex++;
        sections[currentIndex] = {start: movedPoints[i].index, end: movedPoints[i].index}
      }
    }

    let indexOffset = 0;
    let change = false;

    sections.forEach(x => {
      let lowerBound = x.start + indexOffset - 6 > 0 ? x.start + indexOffset - 6 : 0;
      let upperBound = x.end + indexOffset + 5 < points.length - 1 ? x.end + indexOffset + 5 : points.length - 1;

      for (let y = lowerBound + 1; y < upperBound; y++) {
        let dist = VectorUtils.distance(points[y - 1], points[y]);

        if (dist < 7) {
          points.splice(y, 1)
          upperBound--;
          indexOffset--;
          change = true;
        } else if (dist > 15) {
          const dirVec = VectorUtils.directionVector(points[y - 1], points[y]);
          const newPoint = VectorUtils.calculatePoint(points[y - 1], dirVec, 0.5)

          points.splice(y, 0, newPoint);
          indexOffset++;
          upperBound++;
          change = true;
        } else {
        }
      }

    })

    return change;
  }
}

