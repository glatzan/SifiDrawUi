import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SImage} from '../model/SImage';
import {environment} from "../../environments/environment";
import {map} from "rxjs/operators";
import {CImageMapper} from "../utils/cimage-mapper";
import {SAImage} from "../model/SAImage";
import {AbstractHttpService} from "./abstract-http-service";

@Injectable({
  providedIn: 'root'
})
export class ImageService extends AbstractHttpService {

  constructor(private http: HttpClient) {
    super()
  }

  public getImage(id: string, format: string = "png"): Observable<SImage> {
    return this.http.get<SImage>(`${environment.backendUrl}/image/${id}?format=${format}`).pipe(
      map(x => CImageMapper.mapICImageToTypescriptObject<SImage>(x))
    );
  }

  public updateImage(image: SImage): Observable<SImage> {
    image.concurrencyCounter++;
    return this.http.put<SImage>(`${environment.backendUrl}/image/update`, image, ImageService.httpJsonContent).pipe(
      map(x => CImageMapper.mapICImageToTypescriptObject<SImage>(x))
    );
  }

  public moveImageToParent(imageID: String, parentID: string): Observable<SImage> {
    return this.http.get<SImage>(`${environment.backendUrl}/image/moveToParent/${imageID}?parentID=${parentID}`).pipe(
      map(x => CImageMapper.mapICImageToTypescriptObject<SImage>(x))
    );
  }

  public deleteImage(image: SAImage): Observable<any> {
    return this.http.delete<any>(`${environment.backendUrl}/image/delete/${image.id}`);
  }

  public cloneImage(image: SImage, parentID: string = ""): Observable<SImage> {
    return this.http.get<SImage>(`${environment.backendUrl}/image/clone/${image.id}?parentID=${parentID}`).pipe(
      map(x => CImageMapper.mapICImageToTypescriptObject<SImage>(x))
    );
  }

  public renameImage(image: SImage): Observable<SImage> {
    return this.http.get<SImage>(`${environment.backendUrl}/image/rename/${image.id}?parentID=${btoa(image.name)}`).pipe(
      map(x => CImageMapper.mapICImageToTypescriptObject<SImage>(x))
    );
  }

  public uploadImage(file, parentID: string, format = "png"): Observable<SImage> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<SImage>(`${environment.backendUrl}/image/upload/${parentID}?format=${format}`, formData).pipe(
      map(x => CImageMapper.mapICImageToTypescriptObject<SImage>(x))
    );
  }
}
