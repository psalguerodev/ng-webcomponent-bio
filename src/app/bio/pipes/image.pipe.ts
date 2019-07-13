import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment';

@Pipe({
  name: 'image'
})
export class ImagePipe implements PipeTransform {

  transform(imagePath: any): string {
    return (imagePath !== undefined) ? `${environment.assets_path}${imagePath}` : '';
  }

}
