import { Component, OnInit, Inject, OnDestroy, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { BiometricData } from '../../models/biometricdata.model';
import { BiometricService, HandlerValidation } from '../../services/biometric.service';
import { Subscription } from 'rxjs';
import { BioConst } from '../../config/bio.const';
import { BioVerify } from '../../models/bioverify.model';

@Component({
  selector: 'app-biometric-popup',
  templateUrl: './biometric-popup.component.html',
  styleUrls: ['./biometric-popup.component.styl'],
  encapsulation: ViewEncapsulation.None
})
export class BiometricPopupComponent implements OnInit, OnDestroy {

  documentType: string;
  documentNumber: string;
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
              @Inject(MAT_DIALOG_DATA) private readonly data: BiometricData,
              private readonly biometricService: BiometricService) {
    dialogRef.disableClose = true;
    this.maxIntent = BioConst.defaultMaxIntent;
  }

  ngOnInit() {
    this.documentNumber = this.data.documentNumber;
    this.documentType = this.data.documentType;
    this.biometricService.inicialize({
      documentType: this.documentType,
      documentNumber: this.documentNumber
    });

    this.isLoading = true;
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
          setTimeout(_ => this.cancelValidation(true) , 2000);
        }
      });
  }

  ngOnDestroy() {
    if (this.inicializeSubscription) {
      this.inicializeSubscription.unsubscribe();
      console.log(`Destroy [biometric_component]`);
    }
  }

  initValidation() {
    this.isLoading = true;
    this.handlerValidation = undefined;
    this.biometricService.validation$.subscribe((response: HandlerValidation) => {
      this.currentFinger = this.biometricService.nextFinger;
      this.currentIntent = this.biometricService.currentIntent;
      this.isFinal = response.isFinal;
      this.isLoading = false;
      this.currentVerify = this.biometricService.bioverify;
      this.handlerValidation = response;
      if ( this.isFinal) {
         setTimeout(_ => this.cancelValidation(true) , 2000);
      }
    });
    this.biometricService.inicializeValidation();
  }

  cancelValidation(invoke: boolean) {
    if (!invoke) {
      this.handlerValidation = { isError: false, message: 'Se canceló la operación', isFinal: false};
    }
    this.dialogRef.close(this.handlerValidation);
  }

}
