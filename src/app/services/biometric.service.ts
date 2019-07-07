import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, map, delay, tap, finalize } from 'rxjs/operators';
import { throwError, Subject, Observable, forkJoin } from 'rxjs';
import { WinUser } from '../models/winuser.model';
import { BioInfo } from '../models/bioinfo.model';
import { InputUser } from '../models/inputuser.model';
import { BioConst } from '../config/bio.const';
import { BioBusiness } from '../business/bio.bus';
import { HttpnativeService } from './httpnative.service';
import { AxiosResponse } from 'axios';

const DELAY_RESPONSE = 0;

@Injectable({
  providedIn: 'root'
})
export class BiometricService {

  inputUser: InputUser;
  winuser: WinUser;
  bioinfo: BioInfo;
  inicialize$: Subject<boolean> = new Subject<boolean>();
  isCheckBiomatch: boolean;
  nextFinger: string;

  constructor(private readonly http: HttpClient,
              private readonly httpNative: HttpnativeService) { }

  private getBestFingers(inputUser: InputUser) {
    return this.http.get(`${environment.base_api}${BioConst.getInfoPath}`)
      .pipe(
        delay(DELAY_RESPONSE),
        map((response: any) => {
          return response.MessageResponse.Body.getInfoResponse.return as BioInfo;
        }),
        tap((bioInfo: BioInfo) => {
          if (!BioBusiness.verifyInfoResponse(bioInfo)) {
            throw new Error('Ocurred error');
          }
        }),
        catchError(error => throwError(error)),
      );
  }

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

  private checkBiomatch(): Observable<boolean> {
    return this.httpNative.post<any>(`${environment.base_biomatch}${BioConst.biomatchPath}`,
      BioBusiness.generateRequestCheck(), null)
      .pipe(
        map((response: AxiosResponse<any>) => {
          return ((response.data as string).indexOf('OK') !== -1) ? true : false;
        }),
        catchError(error => throwError(error)),
      );
  }

  invokeBiomatch(): Observable<any> {
    return this.httpNative.post<any>(`${environment.base_biomatch}${BioConst.biomatchPath}`,
      BioBusiness.generateRequestVerify(), null)
      .pipe(delay(2000));
  }

  verifyFinger(): Observable<any> {
    return this.http.post(`${environment.base_api}${BioConst.verifyPath}`, {})
      .pipe(
        map((response: any) => {
          return response.MessageResponse.Body.verifyMorphoResponse.return;
        }),
        catchError(error => throwError(error))
      );
  }

  inicialize(inputUser: InputUser): void {
    forkJoin([this.checkBiomatch(), this.getBestFingers(inputUser), this.getComputerInfo()])
      .pipe(
        finalize(() => console.log('End [biometric_service]'))
      )
      .subscribe(responses => {
        this.isCheckBiomatch = responses[0] as boolean;
        this.bioinfo = responses[1] as BioInfo;
        this.winuser = responses[2] as WinUser;
        this.inicialize$.next(true);
      }, _ => {
        this.inicialize$.next(false);
      });
  }

}
