import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, MatDialogModule, MatProgressSpinnerModule } from '@angular/material';
import { HttpClientModule } from '@angular/common/http';
import { BiometricPopupComponent } from './components/biometric-popup/biometric-popup.component';
import { BiometricButtonComponent } from './components/biometric-button/biometric-button.component';
import { HttpnativeService } from './services/httpnative.service';
import { BiometricService } from './services/biometric.service';
import { ImagePipe } from './pipes/image.pipe';
import { FingerimagePipe } from './pipes/fingerimage.pipe';
import { FingerPipe } from './pipes/finger.pipe';

@NgModule({
  declarations: [
    BiometricPopupComponent,
    BiometricButtonComponent,
    ImagePipe,
    FingerPipe,
    FingerimagePipe,
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    HttpClientModule,
  ],
  providers: [
    HttpnativeService,
    BiometricService
  ],
  exports: [
    BiometricPopupComponent,
    BiometricButtonComponent
  ],
})
export class BioModule { }
