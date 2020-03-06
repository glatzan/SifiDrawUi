import {ImageService} from "../../service/image.service";
import {ImageGroupService} from "../../service/image-group.service";
import {ProcessCallback} from "../processCallback";
import {DisplayCallback} from "../display-callback";
import {CImage} from "../../model/CImage";

namespace Filter {

  export class Services {
    public imageService: ImageService;

    public imageGroupService: ImageGroupService;

    public processCallback: ProcessCallback;

    public displayCallback: DisplayCallback;

    constructor(processCallback?: ProcessCallback, displayCallback?: DisplayCallback) {

      this.processCallback = processCallback || {
        callback(): void {
        }
      } as ProcessCallback;

      this.displayCallback = displayCallback || {
        displayCallBack(image: CImage): void {

        },
        addImage(image: CImage): void {

        }
      } as DisplayCallback
    }
  }

  export class AbstractFilter {

    services : Services;

    constructor(services : Services) {
      this.services = services;
    }
  }
}
