import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';

import { AppComponent } from './app.component';
import { BiometricButtonComponent } from './components/biometric-button/biometric-button.component';
import { BiometricPopupComponent } from './components/biometric-popup/biometric-popup.component';
import { BiometricService } from './services/biometric.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, MatDialogModule, MatProgressSpinnerModule } from '@angular/material';
import { HttpClientModule } from '@angular/common/http';
import { HttpnativeService } from './services/httpnative.service';
import { FingerPipe } from './pipes/finger.pipe';
import { ImagePipe } from './pipes/image.pipe';
import { FingerimagePipe } from './pipes/fingerimage.pipe';

declare const customElements;

@NgModule({
  declarations: [
    AppComponent,
    BiometricButtonComponent,
    BiometricPopupComponent,
    FingerPipe,
    ImagePipe,
    FingerimagePipe,
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
    BiometricService,
    HttpnativeService
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    BiometricButtonComponent,
    BiometricPopupComponent,
  ]
})
export class AppModule {

  constructor(private readonly injector: Injector) {}

  ngDoBootstrap(): void {
    console.log('[ibk-bio] inicialize');
    const { injector } = this;
    const ngCustomElement = createCustomElement(BiometricButtonComponent, { injector });
    customElements.define('ibk-bio', ngCustomElement);
  }

}
