import { CanActivate, ExecutionContext, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArtworksService } from '../../modules/artworks/artworks.service';
import { Artist } from '../../modules/artists/entities/artist.entity';
import { Role } from '../../modules/users/enums/role.enum';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private readonly artworksService: ArtworksService,
    @InjectRepository(Artist)
    private readonly artistRepository: Repository<Artist>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const artworkId = request.params.id;

    if (!user || !artworkId) {
      return false;
    }

    // L'Admin a tous les droits
    if (user.role === Role.ADMIN) {
      return true;
    }

    // On récupère le profil de l'artiste correspondant à l'utilisateur connecté
    const artist = await this.artistRepository.findOne({ where: { userId: user.userId } });
    if (!artist) {
      throw new ForbiddenException('Vous n\'avez pas de profil artiste.');
    }

    // On récupère l'œuvre ciblée
    const artwork = await this.artworksService.findOne(artworkId);

    // On vérifie que l'œuvre appartient bien à cet artiste
    if (artwork.artistId !== artist.id) {
      throw new ForbiddenException('Vous n\'êtes pas le propriétaire de cette œuvre d\'art.');
    }

    return true;
  }
}
