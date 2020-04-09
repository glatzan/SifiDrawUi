import {SAImage} from '../model/SAImage';
import {SImage} from '../model/SImage';
import {SImageGroup} from '../model/SImageGroup';
import {Dataset} from "../model/dataset";

export class CImageMapper {

  static mapDatasetToTypescriptObject(obj: Dataset): Dataset {
    const images = [];
    for (const img of obj.images) {
      if (img != null)
        images.push(CImageMapper.mapICImageToTypescriptObject(img));
    }
    obj.images = images;
    return obj;
  }

  static mapICImageToTypescriptObject<T>(obj: SAImage): T {
    if (obj.type === 'img') {
      // @ts-ignore
      return Object.assign(new SImage(), obj);
    } else if (obj.type === 'group') {
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
