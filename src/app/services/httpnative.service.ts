import { Injectable } from '@angular/core';
import httpNative from '../config/http.axios';
import { fromPromise } from 'rxjs/internal/observable/fromPromise';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable({
  providedIn: 'root'
})
export class HttpnativeService {

  constructor() { }

  post<T>(url: string, xmldata: string, options: any): Observable<AxiosResponse<T>> {
    return fromPromise(httpNative.post(url, xmldata, {
      headers: {
        'Content-Type': 'text/xml'
      },
      timeout: 10000
    }));
  }
}
