import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Subscription } from 'rxjs';
import { BioConst } from '../../config/bio.const';
import { BioVerify } from '../../models/bioverify.model';
import { InputUser } from '../../models/inputuser.model';
import { BiometricService, HandlerValidation } from '../../services/biometric.service';

@Component({
  selector: 'app-biometric-popup',
  templateUrl: './biometric-popup.component.html',
  styleUrls: ['./biometric-popup.component.styl']
})
export class BiometricPopupComponent implements OnInit, OnDestroy {

  inputUser: InputUser;
  isInicialize: boolean;

  inicializeSubscription: Subscription;
  validationSubscription: Subscription;
  timerSubscription: Subscription;

  isLoading: boolean;
  isFinal = false;
  isHit: boolean;
  showPreviewImages: boolean;
  showError: boolean;
  messageError: string;
  showValidateOk: boolean;

  currentFinger: string;
  currentIntent: number;
  maxIntent: number;
  timer: string;

  currentVerify: BioVerify;
  handlerValidation: HandlerValidation;

  constructor(private readonly dialogRef: MatDialogRef<BiometricPopupComponent>,
              @Inject(MAT_DIALOG_DATA) private readonly data: InputUser,
              private readonly biometricService: BiometricService) {
    dialogRef.disableClose = true;
    this.maxIntent = BioConst.defaultMaxIntent;
    this.handlerValidation = { isError: false, isFinal: false };
  }

  ngOnInit() {
    this.isLoading = true;
    this.inputUser = this.data;
    this.biometricService.inicialize(this.inputUser);

    if (!this.timerSubscription) {
      this.timerSubscription = this.biometricService.timer$.subscribe((time: string) => this.timer = time);
    }

    this.inicializeSubscription = this.biometricService.inicialize$
      .subscribe((validation: HandlerValidation) => {
        this.isLoading = false;
        this.isInicialize = !validation.isError;
        this.showError = (!this.isInicialize) ? true : false;

        if (this.isInicialize) {
          this.currentFinger = this.biometricService.nextFinger.finger;
          this.currentIntent = this.biometricService.currentIntent;
        } else {
          this.handlerValidation = { isError: true, message: validation.message, isFinal: false };
          setTimeout(_ => this.closeModal(true), BioConst.defaultTimeoutClosePopup);
        }
      });
  }

  ngOnDestroy() {
    if (this.inicializeSubscription) {
      this.inicializeSubscription.unsubscribe();
    }
    if (this.validationSubscription) {
      this.validationSubscription.unsubscribe();
    }
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    console.log(`Destroy [biometric_component] and [unsubscribe]`);
  }

  initValidation() {
    this.isLoading = true;
    this.handlerValidation = undefined;
    this.handlerValidationSubscription();
    this.biometricService.inicializeValidation();
  }

  handlerValidationSubscription(): void { // TODO ✅ Handler unsubcribe process
    if (!this.validationSubscription) {
      console.log(`Subscription validation init`);
      this.validationSubscription = this.biometricService.validation$.subscribe((response: HandlerValidation) => {
        this.handlerValidation = response;
        this.timer = null;

        if (response.isHit) { // Is HIT Validation
          this.showValidateOk = true;
          this.showPreviewImages = true;
          setTimeout(_ => this.closeModal(true), 2000);
        }

        if (response.isFinal && response.isError) {
          setTimeout(_ => this.closeModal(true), 2000);
        }

        this.currentFinger = this.biometricService.nextFinger.finger;
        this.isHit = response.isHit;
        this.currentIntent = this.biometricService.currentIntent;
        this.isFinal = response.isFinal;
        this.isLoading = false;
        this.currentVerify = this.biometricService.bioverify;
      });
    }
  }

  closeModal(invoke: boolean) {
    if (!invoke) {
      this.handlerValidation = {
        isError: false,
        message: BioConst.messageResponse.OPERATION_CANCELLED,
        isCanceled: true
      };
    }
    this.dialogRef.close(this.handlerValidation);
  }

}
