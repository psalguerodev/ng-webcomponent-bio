import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, map, delay, tap } from 'rxjs/operators';
import { throwError, Subject, Observable, } from 'rxjs';
import { WinUser } from '../models/winuser.model';
import { BioInfo } from '../models/bioinfo.model';
import { InputUser } from '../models/inputuser.model';
import { BioPath } from '../config/bio.path';
import { BioUtil } from '../util/bio.util.ts';

@Injectable({
  providedIn: 'root'
})
export class BiometricService {

  // tslint:disable-next-line: variable-name
  private _inputUser: InputUser;
  winuser: WinUser;
  bioinfo: BioInfo;
  inicialize$: Subject<boolean> = new Subject<boolean>();
  waiting$: Subject<Date> = new Subject<Date>();

  constructor(private readonly http: HttpClient) { }

  private getBestFingers() {
    return this.http.post(`${environment.agentApi}${BioPath.getInfo}`, {})
      .pipe(
        delay(1000),
        map((response: any) => {
          return response.MessageResponse.Body.getInfoResponse.return as BioInfo;
        }),
        tap((bioInfo: BioInfo) => {
          if (!BioUtil.verifyInfoResponse(bioInfo)) {
            throw new Error('Ocurred error');
          }
          return bioInfo;
        }),
        catchError(error => throwError(error)),
      );
  }

  private getComputerInfo(): Observable<WinUser> {
    return this.http.get(`${environment.agentApi}${BioPath.wininfo}`)
      .pipe(
        delay(1000),
        map((response: any) => {
          return response.user as WinUser;
        }),
        catchError(error => throwError(error))
      );
  }

  inicialize(inputUser: InputUser): void {
    this.inputuser = inputUser;
    this.getComputerInfo().subscribe((winuser: WinUser) => {
      this.winuser = winuser;
      this.getBestFingers().subscribe((fingerInfo: BioInfo) => {
        this.bioinfo = fingerInfo;
        this.inicialize$.next(true);
      }, _ => this.inicialize$.next(false));
    }, _ => this.inicialize$.next(false));
  }

  verifyFinger() {
    return this.http.post(`${environment.agentApi}${BioPath.verify}`, {})
      .pipe(
        map((response: any) => {
          return response.MessageResponse.Body.verifyMorphoResponse.return;
        }),
        catchError(error => throwError(error))
      );
  }

  set inputuser(inputUser: InputUser) {
    this._inputUser = inputUser;
  }
  get inputuser(): InputUser {
    return this._inputUser;
  }

}
