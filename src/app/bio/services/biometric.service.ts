import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AxiosResponse } from 'axios';
import { forkJoin, Observable, Subject } from 'rxjs';
import { catchError, finalize, map, tap, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { BioValidators, NextFinger } from '../business/bio.bus';
import { BioConst } from '../config/bio.const';
import { BioOperation } from '../enums/bio.operation';
import { DocumentType } from '../enums/document.type';
import { BioInfo } from '../models/bioinfo.model';
import { BioVerify } from '../models/bioverify.model';
import { InputUser } from '../models/inputuser.model';
import { BioInfoRequest } from '../models/request/bioinfo.request';
import { BioVerifyRequest } from '../models/request/bioverify.request';
import { WinUser } from '../models/winuser.model';
import { BiometricServiceBase } from './biomatric.base.service';
import { HttpnativeService, NativeOptions } from './httpnative.service';

declare const DOMParser;

export interface HandlerValidation {
  isFinal?: boolean;
  isHit?: boolean;
  message?: string;
  isCanceled?: boolean;
  isTimeout?: boolean;
  isError: boolean;
}

export interface BiomatchTemplateReponse {
  isError: boolean;
  template: string;
}

@Injectable({
  providedIn: 'root'
})
export class BiometricService extends BiometricServiceBase {

  inicialize$: Subject<HandlerValidation> = new Subject<HandlerValidation>();
  validation$: Subject<HandlerValidation> = new Subject<HandlerValidation>();
  timer$: Subject<string> = new Subject<string>();

  inputUser: InputUser; // Input data from webcomponent host
  winuser: WinUser;
  bioinfo: BioInfo;
  bioverify: BioVerify;
  currentOperation: BioOperation;

  timerInterval;
  timeValidation = BioConst.defaultTimeValidationInSeconds;

  isFinalIntent = false;
  isCheckBiomatch: boolean;
  nextFinger: NextFinger;
  currentTemplate: string;
  currentIntent = 0;

  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'X-IBM-Client-Id': environment.bioConfig.x_ibm_client_id
  });

  private nativeOptions: NativeOptions = {
    headers: { 'Content-Type': 'text/xml' }
  };

  private readonly bioValidator: BioValidators;

  constructor(private readonly http: HttpClient,
              private readonly httpNative: HttpnativeService) {
    super();
    this.bioValidator = new BioValidators();
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
    this.nextFinger = this.bioValidator.getNextFinger(this.bioinfo, this.currentIntent);
    this.currentOperation = this.nextFinger.bioOperation;
  }

  private checkBiomatch(): Observable<boolean> {
    return this.httpNative.post<any>(`${environment.base_biomatch}${BioConst.biomatchPath}`,
      this.generateRequestCheck(), this.nativeOptions)
      .pipe(
        timeout(BioConst.defaultTimeoutCheckBiomatch),
        map((response: AxiosResponse<any>) => {
          return ((response.data as string).indexOf('OK') !== -1) ? true : false;
        }),
        catchError(error => {
          return this.handlerObservableError('Biomatch Check', error,
            BioConst.messageResponse.TIMEOUT_BIOGATEGAY, BioConst.messageResponse.BIOMATCH_CHECK_ERROR);
        }));
  }

  private getComputerInfo(): Observable<WinUser> {
    return this.http.get(`${environment.base_agent}${BioConst.wininfoPath}`)
      .pipe(
        timeout(BioConst.defaultTimeoutAgent),
        map((response: any) => {
          return response.body.user as WinUser;
        }),
        catchError(error => {
          return this.handlerObservableError('Ux Agent', error, BioConst.messageResponse.TIMEOUT_BIOMATCH);
        }),
      );
  }

  private getBestFingers() {
    const requestParams: BioInfoRequest = {
      coError: this.inputUser.channel,
      dniAutorizador: environment.bioConfig.dniAuthorizer,
      host: this.winuser.hostName,
      ipCliente: this.winuser.ipAddress,
      isError: 'false',
      numeroDocumento: this.inputUser.documentNumber,
      macCliente: this.winuser.macAddress,
      numeroSolicitud: window.location.host,
      tipoDocumento: '1',
      usuario: this.inputUser.register
    };

    const params = this.getParams(requestParams);
    const headers = this.headers;

    return this.http.get(`${environment.base_api}${BioConst.getInfoPath}`, { params, headers })
      .pipe(
        timeout(BioConst.defaultTimeoutBioGateway),
        map((response: any) => {
          return response.MessageResponse.Body.getInfoResponse.return as BioInfo;
        }),
        tap((bioInfo: BioInfo) => {
          if (!this.bioValidator.verifyInfoResponse(bioInfo)) {
            throw new Error(this.bioValidator.findMessageByCode(bioInfo.codigoRespuesta)).message;
          }
          this.bioinfo = bioInfo;
          this.getNextFinger();
        },
        ),
        catchError(error => {
          return this.handlerObservableError('Mejores Huellas', error, BioConst.messageResponse.TIMEOUT_BIOGATEGAY, error.message);
        }),
      );
  }

  private invokeBiomatch(): Observable<BiomatchTemplateReponse> {
    return this.httpNative.post(`${environment.base_biomatch}${BioConst.biomatchPath}`,
      this.generateRequestVerify(this.nextFinger.finger), this.nativeOptions)
      .pipe(
        timeout(BioConst.defaultTimeValidationInSeconds * 1000), // Mileseconds
        map(response => {
          const parser = new DOMParser();
          const xmlResponse = parser.parseFromString(response.data, 'text/xml');
          const returnValue = xmlResponse.querySelectorAll('return');
          const resultResponse: string = returnValue[0].textContent;
          const resultSplit: string[] = resultResponse.split(':');
          const codeResponse = resultSplit[0]; // Status reponse

          const verifyBiomatchResponse = this.bioValidator.verifyBiomatchInvokeResponse(codeResponse);

          if (!verifyBiomatchResponse || verifyBiomatchResponse.isError) {
            throw new Error(verifyBiomatchResponse.description);
          }

          const fingerTemplate = this.bioValidator.transformResponseBiomatch(resultSplit[1]);
          return { isError: false, template: fingerTemplate } as BiomatchTemplateReponse;
        }),
        catchError(error => {
          return this.handlerObservableError('Biomatch', error,
              BioConst.messageResponse.TIMEOUT_BIOMATCH, error.message);
        }),
      );
  }

  private verifyFinger(): Observable<BioVerify> {
    const requestParmas: BioVerifyRequest = {
      aplicacionOrigen: this.inputUser.channel,
      codigoTienda: this.inputUser.store,
      dniAutorizador: environment.bioConfig.dniAuthorizer,
      ipCliente: this.winuser.ipAddress,
      registroRF: this.inputUser.register,
      codigoTransaccion: this.inputUser.transactionCode,
      host: this.winuser.hostName,
      indicadorCalidadDedo: '1',
      huellaTemplate: this.currentTemplate,
      macCliente: this.winuser.macAddress,
      indicadorDedo: this.nextFinger.finger,
      numeroDocumento: this.inputUser.documentNumber,
      numeroSolicitud: window.location.host,
      tipoDocumento: DocumentType.DNI,
      tipoVerificacion: this.currentOperation,
      usuario: this.inputUser.register
    };

    const headers = this.headers;
    const params = this.getParams(requestParmas);

    return this.http.get(`${environment.base_api}${BioConst.verifyPath}`, { headers, params })
      .pipe(
        timeout(BioConst.defaultTimeoutBioGateway),
        map((response: any) => {
          return response.MessageResponse.Body.verifyMorphoResponse.return as BioVerify;
        }),
        tap((verify: BioVerify) => {
          this.bioverify = verify;
          
          if (!this.bioValidator.verifyValidFinger(verify)) {
            throw new Error(this.bioValidator.findMessageByCode(verify.codigoRespuestaReniec)).message;
          }
          this.getNextFinger();
        }),
        catchError(error => {
          return this.handlerObservableError('Verificar huellas', error,
              BioConst.messageResponse.TIMEOUT_BIOGATEGAY, error.message);
        })
      );
  }

  private initTimerValidation(): void {
    this.timerInterval = setInterval(() => {
      this.timer$.next(this.timeValidation.toString());
      this.timeValidation--;
    }, 1000);
  }

  private finishTimerValidation(): void {
    clearInterval(this.timerInterval);
    this.timeValidation = BioConst.defaultTimeValidationInSeconds;
  }

  inicialize(inputUser: InputUser): void {
    this.currentIntent = 0;
    this.isFinalIntent = false;
    this.inputUser = inputUser;
    forkJoin([this.checkBiomatch(), this.getComputerInfo()])
      .subscribe(responses => {
        this.winuser = responses[1] as WinUser;
        this.isCheckBiomatch = responses[0] as boolean;

        if (!this.isCheckBiomatch) {
          this.inicialize$.next({ isError: true,
            message: BioConst.messageResponse.NODEVICE, isFinal: false });
          return;
        }

        this.getBestFingers()
          .subscribe(response => {
            this.bioinfo = response as BioInfo;
            this.inicialize$.next({ isError: false, isFinal: false });
          }, error => {
            this.inicialize$.next({ isError: true, message: error, isFinal: false });
          });
      }, error => {
        this.inicialize$.next({ isError: true, message: error, isFinal: false });
      });
  }

  inicializeValidation(): void {
    this.initTimerValidation();
    this.invokeBiomatch()
      .pipe(finalize(() => this.finishTimerValidation()))
      .subscribe((templateResonse: BiomatchTemplateReponse) => {
        this.currentTemplate = templateResonse.template;

        this.verifyFinger()
          .subscribe(_ => {
            this.validation$.next({ isFinal: this.isFinalIntent, isError: false, isHit: true });
          }, error => this.validation$.next({ isError: true, message: error,
                      isFinal: this.isFinalIntent, isHit: false }));

      }, error => {
        this.validation$.next({ isError: true, message: error, isFinal: this.isFinalIntent });
      });
  }
}
