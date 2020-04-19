import {SEntity} from "./SEntity";
import {Dataset} from "./dataset";

export class Project extends SEntity {
  datasets: Dataset[];
}
