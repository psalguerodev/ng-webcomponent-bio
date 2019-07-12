import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.styl']
})
export class AppComponent {
  title = 'webcomponent-biometrics';
  result: any;

  handlerFinishProcess(event: any) {
    this.result = event;
  }
}
