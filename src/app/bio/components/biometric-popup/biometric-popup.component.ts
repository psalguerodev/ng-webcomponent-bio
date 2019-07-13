import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { BiometricService, HandlerValidation } from '../../services/biometric.service';
import { Subscription } from 'rxjs';
import { BioConst } from '../../config/bio.const';
import { BioVerify } from '../../models/bioverify.model';
import { InputUser } from 'src/app/bio/models/inputuser.model';

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
  }

  ngOnInit() {
    this.isLoading = true;
    this.inputUser = this.data;
    this.biometricService.inicialize(this.inputUser);
    this.inicializeSubscription = this.biometricService.inicialize$
      .subscribe((validation: HandlerValidation) => {
        this.isLoading = false;
        this.isInicialize = !validation.isError;
        this.showError = (!this.isInicialize ) ? true : false;

        if (this.isInicialize) {
          this.currentFinger = this.biometricService.nextFinger;
          this.currentIntent = this.biometricService.currentIntent;
        } else {
          this.handlerValidation = { isError: true, message: validation.message , isFinal: false};
          setTimeout(_ => this.cancelValidation(true) , BioConst.defaultTimeoutClosePopup);
        }
      });
  }

  ngOnDestroy() {
    if (this.inicializeSubscription) {
      this.inicializeSubscription.unsubscribe();
      console.log(`Destroy [biometric_component]`);
    }
  }

  initValidation() { // TODO Handler emmit message when fail services
    this.isLoading = true;
    this.handlerValidation = undefined;
    this.biometricService.validation$.subscribe((response: HandlerValidation) => {

      console.log(response);

      if (!response.isError) {
        console.log('Success validation!!');
        this.showValidateOk = true;
        this.showPreviewImages = true;
      }

      this.currentFinger = this.biometricService.nextFinger;
      this.currentIntent = this.biometricService.currentIntent;
      this.isFinal = response.isFinal;
      this.isLoading = false;
      this.currentVerify = this.biometricService.bioverify;
      this.handlerValidation = response;

      if (this.isFinal) {
         setTimeout(_ => this.cancelValidation(true) , BioConst.defaultTimeoutClosePopup);
      }
    });
    this.biometricService.inicializeValidation();
  }

  cancelValidation(invoke: boolean) {
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
