import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { BiometricData } from '../../models/biometricdata.model';
import { BiometricService } from '../../services/biometric.service';
import { Subscription } from 'rxjs';
import { BioInfo } from '../../models/bioinfo.model';

@Component({
  selector: 'app-biometric-popup',
  templateUrl: './biometric-popup.component.html',
  styleUrls: ['./biometric-popup.component.styl']
})
export class BiometricPopupComponent implements OnInit, OnDestroy{

  documentType: string;
  documentNumber: string;
  showPreviewImages: boolean;
  isLoading: boolean;
  isInicialize: boolean;
  inicializeSubscription: Subscription;

  showError: boolean;
  showValidateOk: boolean;

  currentFinger: string;

  constructor(private readonly dialogRef: MatDialogRef<BiometricPopupComponent>,
              @Inject(MAT_DIALOG_DATA) private readonly data: BiometricData,
              private readonly biometricService: BiometricService) {
    dialogRef.disableClose = true;
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
      .subscribe((isInicialize: boolean) => {
        this.isLoading = false;
        this.isInicialize = isInicialize;
        this.showError = (!this.isInicialize ) ? true : false;

        if (this.isInicialize) {
          this.currentFinger = this.biometricService.nextFinger;
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
  }

  cancelValidation() {
    this.dialogRef.close();
  }

}
