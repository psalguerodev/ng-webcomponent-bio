import { Injectable } from '@angular/core';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { fromPromise } from 'rxjs/internal/observable/fromPromise';
import { BioConst } from '../config/bio.const';
import httpNative from '../config/http.axios';

export interface NativeOptions {
  headers: object;
}


@Injectable({
  providedIn: 'root'
})
export class HttpnativeService {

  constructor() { }

  post<T>(url: string, xmldata: string, options: NativeOptions): Observable<AxiosResponse<T>> {
    return fromPromise(httpNative.post(url, xmldata, {
      headers: options.headers,
      timeout: BioConst.defaultTimeoutNative
    }));
  }
}
