import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';
import { BiometricPopupComponent } from '../biometric-popup/biometric-popup.component';


@Component({
  selector: 'app-biometric-button',
  templateUrl: './biometric-button.component.html',
  styleUrls: ['./biometric-button.component.styl']
})
export class BiometricButtonComponent implements OnInit {

  resultProcess: any;

  @Input() documentType: string;
  @Input() documentNumber: string;

  @Output() eventFinishProcess: EventEmitter<any> = new EventEmitter<any>();

  constructor(private readonly dialog: MatDialog) { }

  ngOnInit() {
  }

  invokePopUpBiometrics(): void {
    console.log('invokePopUpBiometrics');
    const dialogRef = this.dialog.open(BiometricPopupComponent, {
      width: '700px',
      data: {documentType: this.documentType, documentNumber: this.documentNumber}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.resultProcess = result;
    });
  }

}
