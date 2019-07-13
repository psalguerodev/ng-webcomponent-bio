import { Pipe, PipeTransform } from '@angular/core';
import { BioConst } from '../config/bio.const';

@Pipe({
  name: 'finger'
})
export class FingerPipe implements PipeTransform {

  transform(fingerNumber: string): string {
    return (fingerNumber !== undefined) ? BioConst.fingers
              .find(f => f.number === fingerNumber).name : BioConst.fingers[1].name;
  }

}
