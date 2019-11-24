import {ComplexLine} from "./model/complex-line";
import {Line} from "./model/line";
import VectorUtils from "../vector-utils";
import {Vector} from "./model/vector";
import {Equation, parse} from 'algebra.js';
import DrawUtil from "../draw-util";
import {HostParabola} from "./host-parabola";

export class LineJoiner {
  public static joinComplexLine(line: ComplexLine, parabola: HostParabola, canvas): ComplexLine {
    console.log(`# Join Lines`)
    const sortedLIne = new ComplexLine();
    sortedLIne.id = line.id;
    const l = LineJoiner.joinLines(Object.assign([], line.lines), parabola, canvas);
    console.log(l)
    sortedLIne.addLines(l)
    return sortedLIne;
  }

  public static joinLines(lines: Line[], parabola: HostParabola, canvas): Line[] {
    const result: Line[] = [];

    const optimizedParabola = new HostParabola(new Vector((parabola.topPoint.x / 5) * 5, parabola.topPoint.y), parabola.compress);

    let classificationLines: LineClassification[] = [];

    let i = 0;
    for (let line of lines) {
      const classification = new LineClassification();
      classification.line = line;
      classification.stepsToParabola = 0;
      classification.correlation = LineJoiner.calculateCorrelation(line, parabola);
      classification.distanceToParabola = VectorUtils.mean([LineJoiner.calculateDistanceFromParabola(line.getFirstPoint(), parabola), LineJoiner.calculateDistanceFromParabola(line.getLastPoint(), parabola)]);
      classificationLines.push(classification);
    }

    for (let i = 0; i < classificationLines.length; i++) {
      const startFirst = classificationLines[i].line.getFirstPoint();
      const endFirst = classificationLines[i].line.getLastPoint();

      for (let y = 1 + i; y < classificationLines.length; y++) {
        const startSecond = classificationLines[y].line.getFirstPoint();
        const endSecond = classificationLines[y].line.getLastPoint();

        if ((startFirst.x <= startSecond.x && startSecond.x < endFirst.x) || (startFirst.x < endSecond.x && endSecond.x < endFirst.x)) {
          if (classificationLines[i].distanceToParabola > classificationLines[y].distanceToParabola)
            classificationLines[i].stepsToParabola++;
          else
            classificationLines[y].stepsToParabola++;
        }
      }
    }

    for (let c of classificationLines) {
      console.log(c);
    }


    let firstLine = classificationLines.splice(0, 1)[0];

    result.push(firstLine.line);

    while (classificationLines.length != 0) {
      console.log(`## Start Elements ${firstLine.line.id}`);

      let probab = Number.MIN_VALUE;
      let line: LineClassification = null

      const deletedLines: LineClassification[] = [];

      classificationLines = LineJoiner.calculateAndSortDistance(firstLine, classificationLines);

      let i = 0;
      for (let classification of classificationLines) {
        const prob = classification.caluclateProbabillity();
        console.log(`${classification.line.id} porpb ${prob}`)

        if (prob <= -100) {
          deletedLines.push(classification);
        } else if (line == null || prob > probab) {
          line = classification;
          probab = prob;
        }

        i++;
      }

      for (let del of deletedLines) {
        console.log("Removing line " + del.line.id + " " + classificationLines.indexOf(del))
        classificationLines.splice(classificationLines.indexOf(del), 1);
        DrawUtil.drawPointLineOnCanvas(canvas, del.line.getFirstPoint(), del.line.getLastPoint(), "red", 3, false)
      }

      if (line != null) {
        result.push(line.line);
        firstLine = line;
        classificationLines.splice(classificationLines.indexOf(line), 1);
      }
    }

    return result;
  }

  public static getLineClassification(lines: Line, parabola = {factor: 0.001, xShift: 675, yShift: 100}) {

  }

  public static calculateDistanceFromParabola(vector: Vector, parabola: HostParabola):
    number {
    const parabolaPoint = LineJoiner.calculatePointAtParabola(vector, parabola);
    return VectorUtils.distance(vector, parabolaPoint);
  }

  public static calculatePointAtParabola(vector: Vector, parabola: HostParabola) {
    const equation = `(-500/(x - ${parabola.topPoint.x}))*(%p.x%-x)+(0.001*(x-${parabola.topPoint.x})*(x-${parabola.topPoint.x})+${parabola.topPoint.y})`;
    const equation1 = equation.replace("%p.x%", String(vector.x));
    try {
      const n1 = parse(equation1);
      const quad = new Equation(n1, vector.y);
      const answers = quad.solveFor("x");
      const y = parabola.getY(answers);
      return new Vector(answers, y);
    } catch (e) {
      console.error("error");
    }
  }

  public static calculateCorrelation(line: Line, parabola: HostParabola):
    number {
    const lineY = line.getPoints().map(x => x.y);
    const meanOfLine = VectorUtils.mean(lineY);
    const parabolaY: number[] = [];

    const sdLine = VectorUtils.standardDeviation(lineY)

    for (let i = 0; i < line.getPoints().length; i++) {
      let y = parabola.getY(line.getPoints()[i].x)
      parabolaY.push(y);
    }

    const meanOfParabola = VectorUtils.mean(parabolaY);
    const sdParabola = VectorUtils.standardDeviation(parabolaY);

    let res = 0;
    for (let i = 0; i < line.getPoints().length; i++) {
      res += (lineY[i] - meanOfLine) * (parabolaY[i] - meanOfParabola);
    }

    res = res / lineY.length;
    res = res / (sdLine * sdParabola)

    return res;
  }

  public static calculateAndSortDistance(firstLine: LineClassification, lines: LineClassification[]): LineClassification[] {
    const distanceMap = lines.map(x => Math.ceil(VectorUtils.distance(firstLine.line.getLastPoint(), x.line.getFirstPoint()) / 10) * 10);
    let ranking = 0;
    for (let i = 0; i < lines.length; i++) {

      lines[i].firstLine = firstLine;
      lines[i].ranking = ranking;
      lines[i].distanceToFirstLine = distanceMap[i];

      if (i + 1 >= distanceMap.length || distanceMap[i + 1] !== distanceMap[i]) {
        ranking++;
      }
    }
    return lines;
  }
}

class LineClassification {
  line: Line;
  correlation: number;
  distanceToParabola;
  stepsToParabola: number;

  ranking: number;
  distanceToFirstLine: number;
  firstLine: LineClassification;

  public caluclateProbabillity() {
    let probabillity = 0;

    // if (this.correlation < 0)
    //   probabillity -= 10;
    //
    // if (this.correlation < 0.5)
    //   probabillity--;

    probabillity -= this.stepsToParabola;
    probabillity -= this.ranking;

    if (this.firstLine.line.getLastPoint().x > this.line.getLastPoint().x || this.firstLine.line.getLastPoint().x - 5 > this.line.getFirstPoint().x) {
      probabillity -= 100;
    }

    return probabillity;
  }
}

