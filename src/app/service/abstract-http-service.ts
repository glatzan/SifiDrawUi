import {HttpHeaders} from "@angular/common/http";

export class AbstractHttpService {
  protected static httpJsonContent = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };
}
