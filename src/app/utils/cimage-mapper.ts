import {SAImage} from '../model/SAImage';
import {SImage} from '../model/SImage';
import {SImageGroup} from '../model/SImageGroup';
import {Dataset} from "../model/dataset";
import {Project} from "../model/project";

export class CImageMapper {

  static mapProjectsToTypescriptObject(obj: Project[]): Project[] {
    const result = [];

    for(const p of obj){
      result.push(Object.assign(new Project(), p))
    }

    return result;
  }

  static mapProjectToTypescriptObject(obj: Project): Project {
    const datasets = [];
    for (const dataset of obj.datasets) {
      datasets.push(CImageMapper.mapDatasetToTypescriptObject(dataset));
    }
    const res = Object.assign(new Project(), obj);
    res.datasets = datasets;
    return res;
  }

  static mapDatasetToTypescriptObject(obj: Dataset): Dataset {
    const images = [];
    for (const img of obj.images) {
      if (img != null)
        images.push(CImageMapper.mapICImageToTypescriptObject(img));
    }
    const res = Object.assign(new Dataset(), obj);
    res.images = images;
    return res;
  }

  static mapICImageToTypescriptObject<T>(obj: SAImage): T {
    // img for legacy support
    if (obj.type == 'image' || obj.type == 'img') {
      // @ts-ignore
      return Object.assign(new SImage(), obj);
    } else if (obj.type == 'group') {
      const tmp = Object.assign(new SImageGroup(), obj);
      let y = 0;
      for (const subImg of tmp.images) {
        tmp.images[y] = CImageMapper.mapICImageToTypescriptObject(subImg);
        y++;
      }
      // @ts-ignore
      return tmp;
    } else {
      // @ts-ignore
      return obj;
    }
  }
}
