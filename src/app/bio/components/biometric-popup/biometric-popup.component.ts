import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { InputUser } from '../../models/inputuser.model';
import { Subscription } from 'rxjs';
import { BioVerify } from '../../models/bioverify.model';
import { HandlerValidation, BiometricService } from '../../services/biometric.service';
import { BioConst } from '../../config/bio.const';

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
    console.log(`Destroy [biometric_component]`);
  }

  initValidation() { // TODO Handler emmit message when fail services
    this.isLoading = true;
    this.handlerValidation = undefined;
    this.handlerValidationSubscription();
    this.biometricService.inicializeValidation();
  }

  handlerValidationSubscription(): void { // TODO Handler unsubcribe process
    if (!this.validationSubscription) {
      console.log(`Subscription validation init`);
      this.validationSubscription = this.biometricService.validation$.subscribe((response: HandlerValidation) => {
        if (!response.isError) {
          this.showValidateOk = true;
          this.showPreviewImages = true;
        }

        this.currentFinger = this.biometricService.nextFinger.finger;
        this.isHit = response.isHit;
        this.currentIntent = this.biometricService.currentIntent;
        this.isFinal = response.isFinal;
        this.isLoading = false;
        this.currentVerify = this.biometricService.bioverify;
        this.handlerValidation = response;

      });
    }
  }

  closeModal(invoke: boolean) {
    if (!invoke) {
      this.handlerValidation = {
        isError: false,
        message: BioConst.messageResponse.OPERATION_CANCELLED,
        isFinal: false
      };
    }
    this.dialogRef.close(this.handlerValidation);
  }

}
