import { throwError, Observable } from 'rxjs';
import { BioConst } from '../config/bio.const';
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export  class BiometricServiceBase {

  constructor() {}

  public handlerObservableError(error: any, message: string = BioConst.messageResponse.TIMEOUT_BIOGATEGAY): Observable<never> {
    if (error.name === 'TimeoutError') {
      return throwError(message);
    } else if ( error.name === 'HttpErrorResponse') {
      // TODO Handler error status !== 200
      return throwError(BioConst.messageResponse.HTTP_ERROR_RESPONSE);
    }
    return throwError(error);
  }

  public getParams(request: object): HttpParams {
    let httpParams = new HttpParams();
    for (const key in request) {
      if (request.hasOwnProperty(key)) {
        httpParams = httpParams.set(key, request[key]);
      }
    }
    return httpParams;
  }
}
