import { BioInfo } from '../models/bioinfo.model';
import { WinUser } from '../models/winuser.model';
import { BioConst } from '../config/bio.const';
import { BioVerify } from '../models/bioverify.model';
import { BioStatus } from '../models/bio.status';

export class BioValidators {

  private static validateGategayField(biofield: string): boolean {
    if (biofield !== undefined && biofield.length > 0 && biofield !== '0') {
      return true;
    }
    return false;
  }

  static verifyInfoResponse(bioInfo: BioInfo): boolean {
    // Service Logic
    const bioGategayErrors: string[] = BioConst.bioGateyayStatus
                                      .filter( s => s.isError === true).map(s => s.code);
    if (bioInfo.indMejorHuellaDer === undefined || bioGategayErrors.indexOf(bioInfo.codigoRespuesta) !== -1) {
      return false;
    }
    return true;
  }

  static verifyComputerInfoResponse(winUser: WinUser): boolean {
    // Service Logic
    return true;
  }

  static verifyValidFinger(verify: BioVerify): boolean {
    // Service Logic
    const errorsReniec: string[] = BioConst.reniecStatus.filter(s => s.isError === true)
      .map(r => r.code);
    const bioGatewayErrors: string[] = BioConst.bioGateyayStatus.filter(s => s.isError === true)
      .map(r => r.code);

    if (verify !== undefined && errorsReniec.indexOf(verify.codigoRespuestaReniec) !== -1
         && bioGatewayErrors.indexOf(verify.codigoRespuesta) !== -1 ) {
      return true;
    }

    return false;
  }

  static getNextFinger(bioInfo: BioInfo, intent: number): string {
    // Business Logic
    switch (intent) {
      case 1:
        if (this.validateGategayField(bioInfo.indHuellaDer)) {
          return bioInfo.indHuellaDer;
        } else if ( this.validateGategayField(bioInfo.indHuellaIzq)) {
          return bioInfo.indHuellaIzq;
        } else if (this.validateGategayField(bioInfo.indMejorHuellaDer)) {
          return bioInfo.indMejorHuellaDer;
        } else {
          return bioInfo.indMejorHuellaIzq;
        }
     case 2:
       if (this.validateGategayField(bioInfo.indHuellaIzq)) {
         return bioInfo.indHuellaIzq;
       } else if (this.validateGategayField(bioInfo.indMejorHuellaDer)) {
         return bioInfo.indMejorHuellaDer;
       } else {
         return bioInfo.indMejorHuellaIzq;
       }
     case 3:
       if (this.validateGategayField(bioInfo.indMejorHuellaDer)) {
         return bioInfo.indMejorHuellaDer;
       } else {
         return bioInfo.indMejorHuellaIzq;
       }
      case 4:
        return bioInfo.indMejorHuellaIzq;
    }
    return BioConst.fingers[1].number;
  }

  static verifyBiomatchInvokeResponse(statusCode: string): boolean {
    return true;
  }

  static generateRequestCheck(): string {
    return `<soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope\'
              xmlns:ws='http://ws.client.match.bio.zy.com'>
        <soapenv:Header/>
        <soapenv:Body>
          <ws:check>
          </ws:check>
        </soapenv:Body>
      </soapenv:Envelope>`;
  }

  static generateRequestVerify(): string {
    return `<?xml version='1.0' encoding='UTF-8'?>
      <soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/'
        xmlns:ws='http://ws.client.match.bio.zy.com/'>
        <soapenv:Header />
        <soapenv:Body>
          <ws:bioTxn>
            <arg0>200</arg0>
            <arg1>200</arg1>
            <arg2>1</arg2>
            <arg3>1</arg3>
            <arg4>80</arg4>
            <arg5>60</arg5>
            <arg6>0</arg6>
            <arg7>0</arg7>
            <arg8>0</arg8>
          </ws:bioTxn>
        </soapenv:Body>
      </soapenv:Envelope>`;
  }

  static findMessageByCode(status: string): string {
    let message = '';
    if (status === undefined) {
      return message;
    }
    const reniecStatus: BioStatus[] = BioConst.reniecStatus;
    const biogategayStatus: BioStatus[] = BioConst.bioGateyayStatus;
    const joinStatus = reniecStatus.concat(biogategayStatus);
    message = joinStatus.find( s => s.code === status ).description;
    return message;
  }

  static convertHex2Ascii(value: string): string {
    const hex = value.toString();
    let str = '';
    for (let i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
  }

  static  convertHexToBase64(value: string): string {
    return btoa(String.fromCharCode.apply(null,
      value.replace(/\r|\n/g, '').replace(/([\da-fA-F]{2}) ?/g, '0x$1 ').replace(/ +$/, '').split(' '))
    );
  }

  static transformResponseBiomatch(value: string): string {
    const bodyResponseString: string = BioValidators.convertHex2Ascii(value);
    const bodyResponseTemplate: string = BioValidators.convertHexToBase64(bodyResponseString.split(':')[5]);
    return bodyResponseTemplate;
  }

}
