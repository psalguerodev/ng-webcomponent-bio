import { Injector, NgModule } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { BioModule } from './bio/bio.module';
import { BiometricButtonComponent } from './bio/components/biometric-button/biometric-button.component';
import { BiometricPopupComponent } from './bio/components/biometric-popup/biometric-popup.component';

declare const customElements;

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BioModule
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
