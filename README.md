# Interbank | webcomponent-biometric

## Details
This project has been made with angular and angular material 8.

## Run

### Install Dependencies
* `npm install`

### Run with environment local
* `ng serve --configuration=local`

### Test
* `npm run test`

## Pre Requisites 📌

* UXRF Agent running `https://localdev.uxagent.com:2223/uxagent/api/user` - with SSL
* Drivers of Biomatric Device `Morpho`
* Biomatch Client running `http://localhost:3000/biomatch` - with SSL


## Use
### Add script in your project
* `<script src="ibkcdn.com/bio/v1/main.js" async=true>`
* or dynamic load 🎯

```typescript
  loadScript(idScript): void {
        if (!document.getElementById(idScript)) {
          const node = document.createElement('script');
          node.src = 'ibkcdn.com/bio/v1/main.js';
          node.type = 'text/javascript';
          node.async = true;
          node.id = idScript;
          node.charset = 'utf-8';
          document.body.appendChild(node);
        }
    }
```

### Integration

* The webcomponent `<ibk-wc-bio>` have attributes and emit one event `(resolveProcess)`

```html
  <ibk-wc-bio
    (resolveProcess)="handlerFinishProcess($event)"
    [documentNumber]="documentNumber"
    [register]="'S36413'"
    [store]="'100'"
    [transactionCode]="'FTI-01'"
    [mode]="'popup'"
    [channel]="'FTI'"
    [documentType]="'DNI'">
  </ibk-wc-bio>
```

* The event `resolveProcess` emit a inteface

```typescript
  export interface HandlerValidation {
    isFinal?: boolean;
    isHit?: boolean;
    message?: string;
    isCanceled?: boolean;
    isTimeout?: boolean;
    isError: boolean;
  }
```

* Sample handler `resolveProcess`

```typescript
  export class AppComponent {
    result: HandlerValidation;

    handlerFinishProcess(even) {
      this.result = event.detail;
    }
  }
```

### Logic

* Short description


## Author
* Team Quantum


## Contributing || Suggestions || Issues 📌
* psalgueroa@intercorp.com.pe | Patrick Salguero


Made with ❤️ - in constant beta 🚀