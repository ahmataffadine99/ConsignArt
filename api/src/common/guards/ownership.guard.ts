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

    // On récupère l'œuvre ciblée
    const artwork = await this.artworksService.findOne(artworkId);
    if (!artwork) throw new NotFoundException("Œuvre introuvable");

    // Si l'utilisateur est un artiste
    if (user.role === Role.ARTIST) {
      const artist = await this.artistRepository.findOne({ where: { userId: user.userId } });
      if (!artist || artwork.artistId !== artist.id) {
        throw new ForbiddenException('Vous n\'êtes pas le propriétaire de cette œuvre d\'art.');
      }
      return true;
    }

    // Si l'utilisateur est une galerie
    if (user.role === Role.GALLERY) {
      // Vérifier que l'artiste de l'œuvre appartient à cette galerie
      const artist = await this.artistRepository.findOne({ where: { id: artwork.artistId, galleryId: user.userId } });
      if (!artist) {
        throw new ForbiddenException('Cette œuvre appartient à un artiste qui n\'est pas géré par votre galerie.');
      }
      return true;
    }

    return false;
  }
}
