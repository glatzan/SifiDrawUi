import {ICImage} from '../model/ICImage';
import {CImage} from '../model/CImage';
import {CImageGroup} from '../model/CImageGroup';

export class CImageMapper {
  static mapToTypescriptObject<T>(obj: ICImage): T {
    if (obj.type === 'img') {
      // @ts-ignore
      return Object.assign(new CImage(), obj);
    } else if (obj.type === 'group') {
      const tmp = Object.assign(new CImageGroup(), obj);
      let y = 0;
      for (const subImg of tmp.images) {
        tmp.images[y] = CImageMapper.mapToTypescriptObject(subImg);
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
