import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BiometricButtonComponent } from './components/biometric-button/biometric-button.component';
import { BiometricPopupComponent } from './components/biometric-popup/biometric-popup.component';
import { BiometricService } from './services/biometric.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, MatDialogModule, MatProgressSpinnerModule } from '@angular/material';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    BiometricButtonComponent,
    BiometricPopupComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatDialogModule,
    HttpClientModule,
    MatProgressSpinnerModule
  ],
  providers: [
    BiometricService
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    BiometricButtonComponent,
    BiometricPopupComponent,
  ]
})
export class AppModule {



}
