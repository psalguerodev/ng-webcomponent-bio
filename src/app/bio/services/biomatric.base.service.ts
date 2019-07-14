import { throwError, Observable } from 'rxjs';
import { BioConst } from '../config/bio.const';
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export abstract class BiometricServiceBase {

  constructor() {}

  // TODO Refactor this method
  public handlerObservableError(origin: string, error: any, message?: string, errorMessage?: string): Observable<never> {
    if (error.name === 'TimeoutError') {
      return throwError(`${origin} - ${message}`);
    } else if (error.name === 'HttpErrorResponse') {
      return throwError(`${origin} - ${BioConst.messageResponse.HTTP_ERROR_RESPONSE}`);
    } else if (error.name === 'Error') {
      if (error.message === 'Network Error') {
        return throwError(`${origin} - Ups! a ocurrido un error de red, verifica tu conexión.`);
      } else if (error.message.indexOf('400') !== -1 ) {
        return throwError(`${origin} - Se envió un solicitud incorrecta.`);
      }
      return throwError(`${origin} - ${errorMessage}`);
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
