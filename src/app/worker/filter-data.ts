import {CImage} from "../model/cimage";

export class FilterData {
  public origImage: CImage;
  public data: {
    origName: string,
    targetName?: string,
    targetDataset?: string,
    targetProject?: string
    batchSize : number;
    numberInBatch : number;
  };
}
