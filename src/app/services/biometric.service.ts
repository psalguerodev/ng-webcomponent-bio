import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, map, delay, tap, finalize } from 'rxjs/operators';
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

declare const DOMParser;
const DELAY_RESPONSE = 0;

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
  currentIntent = 0;

  constructor(private readonly http: HttpClient,
              private readonly httpNative: HttpnativeService) { }

  private getComputerInfo(): Observable<WinUser> {
    return this.http.get(`${environment.base_api}${BioConst.wininfoPath}`)
      .pipe(
        delay(DELAY_RESPONSE),
        map((response: any) => {
          return response.user as WinUser;
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

  private getBestFingers(inputUser: InputUser) {
    return this.http.get(`${environment.base_api}${BioConst.getInfoPath}`)
      .pipe(
        delay(DELAY_RESPONSE),
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
    return this.httpNative.post<any>(`${environment.base_biomatch}${BioConst.biomatchPath}`,
      BioValidators.generateRequestVerify(), null)
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
        delay(DELAY_RESPONSE)
      );
  }

  inicializeValidation(): void {
    this.invokeBiomatch().subscribe((templateResonse: { isError: boolean, template: string}) => {
      console.log(templateResonse.template);

      this.verifyFinger().subscribe( (response) => {
        this.validation$.next({  message: 'Este es un mensaje', isFinal: this.isFinalIntent, isError: false });
      }, error => this.validation$.next({ isError: true, message: error, isFinal: this.isFinalIntent }));

    }, error => {
        this.validation$.next({ isError: true, message: error, isFinal: this.isFinalIntent });
    });
  }

  verifyFinger(): Observable<any> {
    return this.http.get(`${environment.base_api}${BioConst.verifyPath}`)
      .pipe(
        delay(DELAY_RESPONSE + 1000),
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
    forkJoin([this.checkBiomatch(), this.getBestFingers(inputUser), this.getComputerInfo()])
      .pipe(
        finalize(() => console.log('End [biometric_service]'))
      )
      .subscribe(responses => {
        this.isCheckBiomatch = responses[0] as boolean;
        this.bioinfo = responses[1] as BioInfo;
        this.winuser = responses[2] as WinUser;
        this.inicialize$.next({  isError: false, message: '', isFinal: false });
      }, error => {
        this.inicialize$.next({ isError: true, message: error, isFinal: false });
        console.log(error);
      });
  }

}
