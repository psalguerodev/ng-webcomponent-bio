import { BioInfo } from '../models/bioinfo.model';
import { WinUser } from '../models/winuser.model';

export class BioUtil {

  static verifyInfoResponse(bioInfo: BioInfo): boolean {
    return true;
  }

  static verifyComputerInfoResponse(winUser: WinUser): boolean {
    return true;
  }

  static verifyValidFinger(verify: any): boolean {
    return true;
  }
}
