import { throwError, Observable } from 'rxjs';
import { BioConst } from '../config/bio.const';
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export abstract class BiometricServiceBase {

  constructor() { }

  getParams(request: object): HttpParams {
    let httpParams = new HttpParams();
    for (const key in request) {
      if (request.hasOwnProperty(key)) {
        httpParams = httpParams.set(key, request[key]);
      }
    }
    return httpParams;
  }

  generateRequestCheck(): string {
    return `<?xml version='1.0' encoding='UTF-8'?>
      <soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/'
        xmlns:ws='http://ws.client.match.bio.zy.com/'>
        <soapenv:Header/>
        <soapenv:Body>
          <ws:check></ws:check>
        </soapenv:Body>
      </soapenv:Envelope>`;
  }

  generateRequestVerify(fingerNumber: string): string {
    return `<?xml version='1.0' encoding='UTF-8'?>
      <soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/'
        xmlns:ws='http://ws.client.match.bio.zy.com/'>
        <soapenv:Header />
        <soapenv:Body>
          <ws:bioTxn>
            <arg0>${BioConst.biomatchConfig.width}</arg0>
            <arg1>${BioConst.biomatchConfig.height}</arg1>
            <arg2>${BioConst.biomatchConfig.imgFlag}</arg2>
            <arg3>${fingerNumber}</arg3>
            <arg4>${BioConst.biomatchConfig.umbral}</arg4>
            <arg5>${BioConst.biomatchConfig.timeout}</arg5>
            <arg6>${BioConst.biomatchConfig.token}</arg6>
            <arg7>${BioConst.biomatchConfig.visible}</arg7>
            <arg8>${BioConst.biomatchConfig.response}</arg8>
          </ws:bioTxn>
        </soapenv:Body>
      </soapenv:Envelope>`;
  }

  // REFACTOR ⚙️ ️[handlerObservableError]
  handlerObservableError(origin: string, error: any, timeoutmessage?: string, errorMessage?: string): Observable<never> {
    if (error.name === 'TimeoutError') {
      return throwError(`${origin} - ${timeoutmessage}`);
    } else if (error.name === 'HttpErrorResponse') {
      return throwError(`${origin} - ${BioConst.messageResponse.HTTP_ERROR_RESPONSE}`);
    } else if (error.name === 'Error') {
      if (error.message === 'Network Error') {
        return throwError(`${origin} - Ups! a ocurrido un error de red, verifica tu conexión.`);
      } else if (error.message.indexOf('400') !== -1) {
        return throwError(`${origin} - Se envió un solicitud incorrecta.`);
      }
      return throwError(`${origin} - ${errorMessage}`);
    }
    return throwError(error);
  }
}
