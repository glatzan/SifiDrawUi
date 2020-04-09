import {Dataset} from './dataset';
import {SEntity} from "./sentity";

export class Project extends SEntity {
  datasets: Dataset[];
}
