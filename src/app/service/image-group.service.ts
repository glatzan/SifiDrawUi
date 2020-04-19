import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {SImageGroup} from '../model/SImageGroup';
import {SImage} from '../model/SImage';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {CImageMapper} from '../utils/cimage-mapper';
import {AbstractHttpService} from "./abstract-http-service";
import {SAImage} from "../model/SAImage";
import {ImageService} from "./image.service";

@Injectable({
  providedIn: 'root'
})
export class ImageGroupService extends AbstractHttpService {

  constructor(private http: HttpClient, private imageService: ImageService) {
    super();
  }

  public getImageGroup(id: string, minimize = true, format: string = "png"): Observable<SImageGroup> {
    const fetchURL = `${environment.backendUrl}/imagegroup${minimize ? '/minimized' : ''}/${id}?format=${format}`;
    return this.http.get<SImageGroup>(fetchURL).pipe(
      map(x => CImageMapper.mapICImageToTypescriptObject<SImageGroup>(x))
    );
  }

  public createImageGroup(name: string, parentID: String): Observable<SImageGroup> {
    const fetchUrl = `${environment.backendUrl}/imagegroup/create/${btoa(name)}?parentID=${parentID}`;
    return this.http.get<SImageGroup>(fetchUrl);
  }

  public renameImageGroup(image: SImageGroup): Observable<SAImage> {
    return this.http.get<SImageGroup>(`${environment.backendUrl}/image/rename/${image.id}?newName=${btoa(image.name)}`).pipe(
      map(x => CImageMapper.mapICImageToTypescriptObject<SImage>(x))
    );
  }

  public update(image: SAImage): Observable<SAImage> {
    if (image instanceof SImage) {
      return this.imageService.updateImage(image);
    } else {
      (image as SImageGroup).concurrencyCounter++;
      (image as SImageGroup).images.forEach(image => {
        image.concurrencyCounter++;
      });
      return this.http.put<SImageGroup>(`${environment.backendUrl}/imagegroup/update`, (image as SImageGroup), ImageGroupService.httpJsonContent).pipe(
        map(x => CImageMapper.mapICImageToTypescriptObject<SImageGroup>(x))
      );
    }
  }

  public delete(image: SAImage): Observable<any> {
    if (image instanceof SImage) {
      return this.imageService.deleteImage(image)
    } else {
      return this.http.delete<any>(`${environment.backendUrl}/imagegroup/delete/${image.id}`);
    }
  }

  public clone(image: SAImage, parentID: string = ""): Observable<SAImage> {
    if (image instanceof SImage) {
      return this.imageService.cloneImage(image, parentID);
    } else {
      return this.http.get<SImage>(`${environment.backendUrl}/imagegroup/clone/${image.id}?parentID=${parentID}`).pipe(
        map(x => CImageMapper.mapICImageToTypescriptObject<SImageGroup>(x))
      );
    }
  }


}
