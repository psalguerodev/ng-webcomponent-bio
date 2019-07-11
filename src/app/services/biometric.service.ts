import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, map, tap, finalize } from 'rxjs/operators';
import { throwError, Subject, Observable, forkJoin } from 'rxjs';
import { WinUser } from '../models/winuser.model';
import { BioInfo } from '../models/bioinfo.model';
import { InputUser } from '../models/inputuser.model';
import { BioConst } from '../config/bio.const';
import { BioValidators } from '../business/bio.bus';
import { HttpnativeService } from './httpnative.service';
import { AxiosResponse } from 'axios';
import { BioVerify } from '../models/bioverify.model';
import { BioOperation } from '../enums/bio.operation';
import { BioVerifyRequest } from '../models/request/bioverify.request';
import { BioInfoRequest } from '../models/request/bioinfo.request';

declare const DOMParser;

export interface HandlerValidation {
  isFinal: boolean;
  message: string;
  isError: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BiometricService {

  inicialize$: Subject<HandlerValidation> = new Subject<HandlerValidation>();
  validation$: Subject<HandlerValidation> = new Subject<HandlerValidation>();

  inputUser: InputUser;
  winuser: WinUser;
  bioinfo: BioInfo;
  bioverify: BioVerify;
  currentOperation: BioOperation;

  isFinalIntent = false;
  isCheckBiomatch: boolean;
  nextFinger: string;
  currentTemplate: string;
  currentIntent = 0;

  private headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-IBM-Client-Id': environment.bioConfig.x_ibm_client_id
  });

  constructor(private readonly http: HttpClient,
              private readonly httpNative: HttpnativeService) { }

  private getComputerInfo(): Observable<WinUser> {
    return this.http.get(`${environment.base_agent}${BioConst.wininfoPath}`)
      .pipe(
        map((response: any) => {
          return response.body.user as WinUser;
        }),
        catchError(error => throwError(error))
      );
  }

  private incrementIntent(): void {
    if (this.currentIntent > BioConst.defaultMaxIntent - 1) {
      this.currentIntent = 4;
      this.isFinalIntent = true;
    } else {
      this.currentIntent = this.currentIntent + 1;
    }
  }

  private getNextFinger(): void {
    this.incrementIntent();
    this.nextFinger =  BioValidators.getNextFinger(this.bioinfo, this.currentIntent);
  }

  private getBestFingers() {
    const requestParams: BioInfoRequest = {
      coError: '',
      dniAutorizador: environment.bioConfig.dni_authorizer,
      host: this.winuser.hostName,
      ipCliente: this.winuser.ipAddress,
      isError: '',
      numeroDocumento: this.inputUser.documentNumber,
      macCliente: this.winuser.macAddress,
      numeroSolicitud: '',
      tipoDocumento: 'DNI',
      usuario: 'S36413'
    };

    const params = this.getParams(requestParams);

    const headers = this.headers;

    return this.http.get(`${environment.base_api}${BioConst.getInfoPath}`, { params, headers })
      .pipe(
        map((response: any) => {
          return response.MessageResponse.Body.getInfoResponse.return as BioInfo;
        }),
        tap((bioInfo: BioInfo) => {
          if (!BioValidators.verifyInfoResponse(bioInfo)) {
            throw new Error('Invalidad response Bio Info');
          }
          this.bioinfo = bioInfo;
          this.getNextFinger();
        },
        ),
        catchError(error => throwError(error)),
      );
  }

  private getParams(request: object): HttpParams {
    let httpParams = new HttpParams();
    for (const key in request) {
      if (request.hasOwnProperty(key)) {
        httpParams = httpParams.set(key, request[key]);
      }
    }

    return httpParams;
  }

  private checkBiomatch(): Observable<boolean> {
    return this.httpNative.post<any>(`${environment.base_biomatch}${BioConst.biomatchPath}`,
      BioValidators.generateRequestCheck(), null)
      .pipe(
        map((response: AxiosResponse<any>) => {
          return ((response.data as string).indexOf('OK') !== -1) ? true : false;
        }),
        catchError(error => throwError(error)),
      );
  }

  invokeBiomatch(): Observable<{ isError: boolean; template: string}> {
    console.log(`[invokeBiomatch] Next Finger is ${this.nextFinger}`);
    return this.httpNative.post<any>(`${environment.base_biomatch}${BioConst.biomatchPath}`,
      BioValidators.generateRequestVerify(this.nextFinger), null)
      .pipe(
        map(response => {
          const parser = new DOMParser();
          const xmlResponse = parser.parseFromString(response.data, 'text/xml') ;
          const returnValue = xmlResponse.querySelectorAll('return');
          const resultResponse: string = returnValue[0].textContent;
          const resultSplit: string[] = resultResponse.split(':');
          const codeResponse = resultSplit[0]; // Status reponse

          if (!BioValidators.verifyBiomatchInvokeResponse(codeResponse)) {
            throw new Error('Error.....');
          }

          const fingerTemplate = BioValidators.transformResponseBiomatch(resultSplit[1]);
          return { isError: false, template: fingerTemplate };

        }),
        catchError(error => throwError(error.message)),
      );
  }

  inicializeValidation(): void {
    this.invokeBiomatch().subscribe((templateResonse: { isError: boolean, template: string}) => {
      this.currentTemplate = templateResonse.template;
      this.verifyFinger().subscribe( (response) => {
        this.validation$.next({  message: 'Este es un mensaje', isFinal: this.isFinalIntent, isError: false });
      }, error => this.validation$.next({ isError: true, message: error, isFinal: this.isFinalIntent }));

    }, error => {
        this.validation$.next({ isError: true, message: error, isFinal: this.isFinalIntent });
    });
  }

  verifyFinger(): Observable<BioVerify> {
    const requestParmas: BioVerifyRequest = {
      aplicacionOrigen: 'FTI',
      codigoTienda: '100',
      dniAutorizador: environment.bioConfig.dni_authorizer,
      ipCliente: '127.0.0.1',
      registroRF: 'S36413',
      codigoTransaccion: 'BIO',
      host: 'XXX',
      indicadorCalidadDedo: '',
      huellaTemplate: '',
      macCliente: 'MAC-XXX-MAC-XX',
      indicadorDedo: this.nextFinger,
      numeroDocumento: this.inputUser.documentNumber,
      numeroSolicitud: '',
      tipoDocumento: 'DNI',
      tipoVerificacion: '3',
      usuario: 'S36413'
    };

    const headers = this.headers;

    const params = this.getParams(requestParmas);

    return this.http.get(`${environment.base_api}${BioConst.verifyPath}`, { headers, params })
      .pipe(
        map((response: any) => {
          return response.MessageResponse.Body.verifyMorphoResponse.return as BioVerify;
        }),
        tap((verify: BioVerify) => {
          this.bioverify = verify;
          this.getNextFinger();
          if (!BioValidators.verifyValidFinger(verify)) {
            if (this.currentOperation === BioOperation.LOCAL) {
              throw new Error(BioValidators.findMessageByCode(verify.descripcionRespuesta)).message;
            }
            throw new Error(BioValidators.findMessageByCode(verify.codigoRespuestaReniec)).message;
          }
        }),
        catchError(error => throwError(error))
      );
  }

  inicialize(inputUser: InputUser): void {
    this.currentIntent = 0;
    this.isFinalIntent = false;
    this.inputUser = inputUser;
    forkJoin([this.checkBiomatch(), this.getComputerInfo()])
      .pipe(
        finalize(() => console.log('End [biometric_service]'))
      )
      .subscribe(responses => {
        this.winuser = responses[1] as WinUser;
        this.isCheckBiomatch = responses[0] as boolean;
        
        console.log(this.winuser);

        this.getBestFingers().subscribe(response => {
          this.bioinfo = response as BioInfo;
          this.inicialize$.next({  isError: false, message: '', isFinal: false });
        }, error => {
          this.inicialize$.next({ isError: true, message: error, isFinal: false });
        });
      }, error => {
        this.inicialize$.next({ isError: true, message: error, isFinal: false });
        console.log(error);
      });
  }

}
