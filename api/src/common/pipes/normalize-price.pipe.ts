import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class NormalizePricePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // Si c'est un body object et qu'il contient un prix
    if (value && typeof value === 'object' && value.price !== undefined) {
      const numericPrice = parseFloat(value.price);
      if (!isNaN(numericPrice)) {
        // Transforme en valeur absolue (pas de prix négatif) et arrondit à 2 décimales
        value.price = Math.abs(numericPrice).toFixed(2);
      }
    }
    return value;
  }
}
