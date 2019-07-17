import { BioConst } from '../config/bio.const';
import { BioOperation } from '../enums/bio.operation';
import { BioStatus } from '../models/bio.status';
import { BioInfo } from '../models/bioinfo.model';
import { BioVerify } from '../models/bioverify.model';
import { WinUser } from '../models/winuser.model';

export interface NextFinger {
  finger: string;
  bioOperation: BioOperation;
}

export enum BioFingerType {
  RIGTH_LOCAL,
  LEFT_LOCAL,
  RIGTH_RENIEC,
  LEFT_RENIEC
}

export class BioValidators {

  private validateBioFinger(finger: string): boolean {
    if (finger === undefined || finger === '0' || finger.length === 0) {
      return false;
    }
    return true;
  }

  private validatetNextFinger(bioInfo: BioInfo, bioFinger: BioFingerType): NextFinger {
    const nextFinger: NextFinger = {
      bioOperation: BioOperation.LOCAL,
      finger: BioConst.defaultFingerNumber
    };

    switch (bioFinger) {
      case BioFingerType.LEFT_LOCAL:
        if (!this.validateBioFinger(bioInfo.indHuellaIzq)) {
          nextFinger.finger = bioInfo.indMejorHuellaIzq;
          nextFinger.bioOperation = BioOperation.RENIEC;
        } else {
          nextFinger.finger = bioInfo.indHuellaIzq;
          nextFinger.bioOperation = BioOperation.LOCAL;
        }
        break;
      case BioFingerType.RIGTH_LOCAL:
        if (!this.validateBioFinger(bioInfo.indHuellaDer)) {
          nextFinger.finger = bioInfo.indMejorHuellaDer;
          nextFinger.bioOperation = BioOperation.RENIEC;
        } else {
          nextFinger.finger = bioInfo.indHuellaDer;
          nextFinger.bioOperation = BioOperation.LOCAL;
        }
        break;
      case BioFingerType.RIGTH_RENIEC: // Always return reniec finger value
        nextFinger.finger = bioInfo.indMejorHuellaDer;
        nextFinger.bioOperation = BioOperation.RENIEC;
        break;
      case BioFingerType.LEFT_RENIEC:
        nextFinger.finger = bioInfo.indMejorHuellaIzq;
        nextFinger.bioOperation = BioOperation.RENIEC;
        break;
    }

    return nextFinger;
  }

  getNextFinger(bioInfo: BioInfo, intent: number): NextFinger { // TODO Define bussines logic for invoke service
    let nextFinger: NextFinger;

    switch (intent) {
      case 1:
        nextFinger = this.validatetNextFinger(bioInfo, BioFingerType.RIGTH_LOCAL);
        break;
      case 2:
        nextFinger = this.validatetNextFinger(bioInfo, BioFingerType.LEFT_LOCAL);
        break;
      case 3:
        nextFinger = this.validatetNextFinger(bioInfo, BioFingerType.RIGTH_RENIEC);
        break;
      case 4:
        nextFinger = this.validatetNextFinger(bioInfo, BioFingerType.LEFT_RENIEC);
        break;
    }
    console.log(nextFinger);
    return nextFinger;
  }

  verifyInfoResponse(bioInfo: BioInfo): boolean {
    const bioGategayErrors: string[] = BioConst.bioGateyayStatus
      .filter(s => s.isError === true).map(s => s.code);
    if (bioInfo.indMejorHuellaDer === undefined || bioGategayErrors.indexOf(bioInfo.codigoRespuesta) !== -1) {
      return false;
    }
    return true;
  }

  verifyComputerInfoResponse(winUser: WinUser): boolean {
    return true;
  }

  verifyValidFinger(verify: BioVerify): boolean {
    const errorsReniec: string[] = BioConst.reniecStatus.filter(s => s.isError === true)
      .map(r => r.code);
    const bioGatewayErrors: string[] = BioConst.bioGateyayStatus.filter(s => s.isError === true)
      .map(r => r.code);

    if (verify !== undefined && (errorsReniec.indexOf(verify.codigoRespuestaReniec) !== -1
      || bioGatewayErrors.indexOf(verify.codigoRespuesta) !== -1)) {
      return false;
    }

    return true;
  }

  verifyBiomatchInvokeResponse(statusCode: string): BioStatus {
    const biomatchErrors = BioConst.biomatchStatus.filter(s => s.isError === true);
    const hasError = biomatchErrors.find(p => p.code === statusCode);
    return hasError || { isError: false, description: 'OK', code: '0000' };
  }

  findMessageByCode(status: string): string {
    let message = '';
    if (status === undefined) {
      return message;
    }

    const reniecStatus: BioStatus[] = BioConst.reniecStatus;
    const biogategayStatus: BioStatus[] = BioConst.bioGateyayStatus;
    const joinStatus = reniecStatus.concat(biogategayStatus);
    const messageRes = joinStatus.find(s => s.code === status);

    if (messageRes) {
      message = messageRes.description;
    } else {
      message = BioConst.messageResponse.UNKNOW_ERROR;
    }
    return message;
  }

  convertHex2Ascii(value: string): string {
    const hex = value.toString();
    let str = '';
    for (let i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
  }

  convertHexToBase64(value: string): string {
    return btoa(String.fromCharCode.apply(null,
      value.replace(/\r|\n/g, '').replace(/([\da-fA-F]{2}) ?/g, '0x$1 ').replace(/ +$/, '').split(' '))
    );
  }

  transformResponseBiomatch(value: string): string {
    const bodyResponseString: string = this.convertHex2Ascii(value);
    const bodyResponseTemplate: string = this.convertHexToBase64(bodyResponseString.split(':')[5]);
    return bodyResponseTemplate;
  }

}
