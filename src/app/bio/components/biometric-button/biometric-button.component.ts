import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';
import { BiometricPopupComponent } from '../biometric-popup/biometric-popup.component';
import { HandlerValidation } from 'src/app/bio/services/biometric.service';

@Component({
  selector: 'app-biometric-button',
  templateUrl: './biometric-button.component.html',
  styleUrls: ['./biometric-button.component.styl']
})
export class BiometricButtonComponent implements OnInit {

  resultProcess: any;

  @Input() documentType: string;
  @Input() documentNumber: string;
  @Input() mode: string;
  @Input() register: string;
  @Input() channel: string;
  @Input() store: string;
  @Input() transactionCode: string;

  @Output() eventFinishProcess: EventEmitter<HandlerValidation> = new EventEmitter<HandlerValidation>();

  constructor(private readonly dialog: MatDialog) { }

  ngOnInit() {
  }

  invokePopUpBiometrics(): void {
    console.log('Open [biometrics_component]');
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

    dialogRef.afterClosed().subscribe(result => {
      console.log('Closed [biometrics_component]');
      this.resultProcess = result;
      console.log(`Result --> `, this.resultProcess);
      this.eventFinishProcess.emit(this.resultProcess);
    });
  }

}
