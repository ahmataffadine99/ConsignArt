import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { ArtworksService } from '../../modules/artworks/artworks.service';
import { BusinessRuleViolationException } from '../exceptions/business-rule.exception';
import { ArtworkStatus } from '../../modules/artworks/enums/artwork-status.enum';

@Injectable()
export class NotSoldPipe implements PipeTransform {
  constructor(private readonly artworksService: ArtworksService) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    // Si la valeur est vide, on laisse le validateur standard s'en occuper
    if (!value) return value;

    // On récupère l'œuvre depuis la base de données
    const artwork = await this.artworksService.findOne(value);
    
    // Règle métier : On ne peut pas modifier une œuvre qui est déjà vendue
    if (artwork && artwork.status === ArtworkStatus.SOLD) {
      throw new BusinessRuleViolationException("Cette œuvre est déjà vendue, elle ne peut plus être modifiée.");
    }
    
    // Si tout va bien, on retourne l'ID (value) inchangé pour que le contrôleur s'en serve
    return value;
  }
}
