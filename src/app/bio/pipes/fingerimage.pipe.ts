import { Pipe, PipeTransform } from '@angular/core';
import { BioConst } from '../config/bio.const';

@Pipe({
  name: 'fingerimage'
})
export class FingerimagePipe implements PipeTransform {

  transform(fingerNumber: string): string {
    return (fingerNumber !== undefined) ? BioConst.fingers
      .find(f => f.number === fingerNumber).imageName : BioConst.fingers[1].imageName;
  }

}
