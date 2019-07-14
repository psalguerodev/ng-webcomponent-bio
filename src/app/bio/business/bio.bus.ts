import { BioInfo } from '../models/bioinfo.model';
import { WinUser } from '../models/winuser.model';
import { BioConst } from '../config/bio.const';
import { BioVerify } from '../models/bioverify.model';
import { BioStatus } from '../models/bio.status';
import { BioOperation } from '../enums/bio.operation';

export interface NextFinger {
  finger: string;
  bioOperation: BioOperation;
}

export class BioValidators {

  private static validateGategayField(biofield: string): boolean {
    if (biofield !== undefined && biofield.length > 0 && biofield !== '0') {
      return true;
    }
    return false;
  }

  private static setFingers(bioInfo: BioInfo): BioInfo {
    return bioInfo;
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

    if (verify !== undefined && (errorsReniec.indexOf(verify.codigoRespuestaReniec) !== -1
         || bioGatewayErrors.indexOf(verify.codigoRespuesta) !== -1) ) {
      return false;
    }

    return true;
  }

  static getNextFinger(bioInfo: BioInfo, intent: number): NextFinger { // TODO Define bussines logic for invoke service
    // Business Logic
    bioInfo = this.setFingers(bioInfo);
    const nextFinger = { finger: '2', bioOperation: BioOperation.LOCAL  } as NextFinger;

    switch (intent) {
      case 1:
        if (this.validateGategayField(bioInfo.indHuellaDer)) {
          return { finger: bioInfo.indHuellaDer, bioOperation: BioOperation.LOCAL };
        } else if ( this.validateGategayField(bioInfo.indHuellaIzq)) {
          return { finger: bioInfo.indHuellaIzq, bioOperation: BioOperation.LOCAL };
        } else if (this.validateGategayField(bioInfo.indMejorHuellaDer)) {
          return { finger: bioInfo.indMejorHuellaDer, bioOperation: BioOperation.RENIEC };
        } else {
          return { finger: bioInfo.indMejorHuellaIzq, bioOperation: BioOperation.RENIEC };
        }
     case 2:
       if (this.validateGategayField(bioInfo.indHuellaIzq)) {
         return { finger: bioInfo.indHuellaIzq, bioOperation: BioOperation.LOCAL };
       } else if (this.validateGategayField(bioInfo.indMejorHuellaDer)) {
         return { finger: bioInfo.indMejorHuellaDer, bioOperation: BioOperation.RENIEC };
       } else {
         return { finger: bioInfo.indMejorHuellaIzq, bioOperation: BioOperation.RENIEC };
       }
     case 3:
       if (this.validateGategayField(bioInfo.indMejorHuellaDer)) {
         return { finger: bioInfo.indMejorHuellaDer, bioOperation: BioOperation.RENIEC };
       } else {
         return { finger: bioInfo.indMejorHuellaIzq, bioOperation: BioOperation.RENIEC };
       }
      case 4:
        return { finger: bioInfo.indMejorHuellaIzq, bioOperation: BioOperation.RENIEC };
    }
    return nextFinger;
  }

  static verifyBiomatchInvokeResponse(statusCode: string): BioStatus {
    const biomatchErrors = BioConst.biomatchStatus.filter( s => s.isError === true);
    const hasError = biomatchErrors.find(p => p.code === statusCode);
    return hasError || { isError: false, description: 'OK', code: '0000' };
  }

  static generateRequestCheck(): string {
    return `<?xml version='1.0' encoding='UTF-8'?>
      <soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/'
        xmlns:ws='http://ws.client.match.bio.zy.com/'>
        <soapenv:Header/>
        <soapenv:Body>
          <ws:check></ws:check>
        </soapenv:Body>
      </soapenv:Envelope>`;
  }

  static generateRequestVerify(fingerNumber: string): string {
    return `<?xml version='1.0' encoding='UTF-8'?>
      <soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/'
        xmlns:ws='http://ws.client.match.bio.zy.com/'>
        <soapenv:Header />
        <soapenv:Body>
          <ws:bioTxn>
            <arg0>${BioConst.biomatchConfig.width}</arg0>
            <arg1>${BioConst.biomatchConfig.height}</arg1>
            <arg2>${BioConst.biomatchConfig.imgFlag}</arg2>
            <arg3>${fingerNumber}</arg3>
            <arg4>${BioConst.biomatchConfig.umbral}</arg4>
            <arg5>${BioConst.biomatchConfig.timeout}</arg5>
            <arg6>${BioConst.biomatchConfig.token}</arg6>
            <arg7>${BioConst.biomatchConfig.visible}</arg7>
            <arg8>${BioConst.biomatchConfig.response}</arg8>
          </ws:bioTxn>
        </soapenv:Body>
      </soapenv:Envelope>`;
  }

  static findMessageByCode(status: string): string { // TODO Control errors by status
    let message = '';
    if (status === undefined) {
      return message;
    }

    const reniecStatus: BioStatus[] = BioConst.reniecStatus;
    const biogategayStatus: BioStatus[] = BioConst.bioGateyayStatus;
    const joinStatus = reniecStatus.concat(biogategayStatus);
    const messageRes = joinStatus.find( s => s.code === status );

    if (messageRes) {
      message = messageRes.description;
    } else {
      message = BioConst.messageResponse.UNKNOW_ERROR;
    }
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
