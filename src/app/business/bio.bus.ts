import { BioInfo } from '../models/bioinfo.model';
import { WinUser } from '../models/winuser.model';

export class BioBusiness {

  static verifyInfoResponse(bioInfo: BioInfo): boolean {
    // Service Logic
    return true;
  }

  static verifyComputerInfoResponse(winUser: WinUser): boolean {
    // Service Logic
    return true;
  }

  static verifyValidFinger(verify: any): boolean {
    // Service Logic
    return true;
  }

  static getNextFinger(bioInfo: BioInfo, intent: number): string {
    // Business Logic
    return '1';
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
}
