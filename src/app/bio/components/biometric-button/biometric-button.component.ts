import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { BiometricPopupComponent } from '../biometric-popup/biometric-popup.component';
import { HandlerValidation } from 'src/app/bio/services/biometric.service';
import { BioConst } from '../../config/bio.const';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-biometric-button',
  templateUrl: './biometric-button.component.html',
  styleUrls: ['./biometric-button.component.styl']
})
export class BiometricButtonComponent implements OnInit, OnDestroy {

  resultProcess: HandlerValidation;
  dialogSubscription: Subscription;

  @Input() documentType: string;
  @Input() documentNumber: string;
  @Input() register: string;
  @Input() channel: string;
  @Input() store: string;
  @Input() transactionCode: string;
  @Input() autoClose: boolean;

  // Styles 🍺
  @Input() mode: string; // popup
  @Input() textButton: string; // Validar con huella
  @Input() colorHex: string; // #2b2b2b2

  @Output() resolveProcess: EventEmitter<HandlerValidation> = new EventEmitter<HandlerValidation>();

  constructor(private readonly dialog: MatDialog) { }

  ngOnInit(): void {
    if (!this.textButton) {
      this.textButton = BioConst.defaultTextButton;
    }
    if (!this.colorHex) {
      this.colorHex = BioConst.defaultHexColorButton;
    }

    if (!this.autoClose) {
      this.autoClose = false;
    }
  }

  ngOnDestroy(): void {
    if (this.dialogSubscription) {
      this.dialogSubscription.unsubscribe();
      console.log('[biometrics_button] Unsubscribe');
    }
  }

  invokePopUpBiometrics(): void {
    console.log('[biometrics_component] Open');
    const dialogRef = this.dialog.open(BiometricPopupComponent, {
      width: '700px',
      data: {
        documentType: this.documentType,
        documentNumber: this.documentNumber,
        mode: this.mode,
        channel: this.channel,
        register: this.register,
        store: this.store,
        transactionCode: this.transactionCode
      }
    });

    this.dialogSubscription = dialogRef.afterClosed().subscribe(result => {
      console.log('[biometrics_component] Closed');
      this.resultProcess = result;
      this.resolveProcess.emit(this.resultProcess);
    });

  }

}
