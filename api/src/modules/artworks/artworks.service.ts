import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateArtworkDto } from './dto/create-artwork.dto';
import { UpdateArtworkDto } from './dto/update-artwork.dto';
import { Artwork } from './entities/artwork.entity';
import { Artist } from '../artists/entities/artist.entity';

@Injectable()
export class ArtworksService {
  constructor(
    @InjectRepository(Artwork)
    private readonly artworkRepository: Repository<Artwork>,
    @InjectRepository(Artist)
    private readonly artistRepository: Repository<Artist>,
  ) {}

  async create(user: any, createArtworkDto: CreateArtworkDto): Promise<Artwork> {
    let artistId = createArtworkDto.artistId;

    if (user.role === 'artist') {
      // 1. Trouver le profil artiste de cet utilisateur
      const artist = await this.artistRepository.findOne({ where: { userId: user.userId } });
      if (!artist) {
        throw new BadRequestException("Vous devez d'abord créer un profil artiste.");
      }
      artistId = artist.id;
    } else if (user.role === 'gallery') {
      if (!artistId) {
        throw new BadRequestException("Vous devez spécifier artistId pour créer une œuvre.");
      }
      const artist = await this.artistRepository.findOne({ where: { id: artistId, galleryId: user.userId } });
      if (!artist) {
        throw new BadRequestException("Cet artiste n'appartient pas à votre galerie.");
      }
    } else {
      throw new BadRequestException("Rôle non autorisé pour créer une œuvre.");
    }

    // Règle métier : Un artiste ne peut pas avoir plus de 50 œuvres actives (AVAILABLE ou ON_LOAN) simultanément.
    const activeArtworksCount = await this.artworkRepository.count({
      where: [
        { artistId, status: 'available' as any },
        { artistId, status: 'on_loan' as any }
      ]
    });

    if (activeArtworksCount >= 50) {
      throw new BadRequestException("Cet artiste a déjà atteint la limite de 50 œuvres actives.");
    }

    const artwork = this.artworkRepository.create({
      ...createArtworkDto,
      artistId,
    });
    return this.artworkRepository.save(artwork);
  }

  findAll(): Promise<Artwork[]> {
    return this.artworkRepository.find({ relations: { artist: true } });
  }

  async findOne(id: string): Promise<Artwork> {
    const artwork = await this.artworkRepository.findOne({ where: { id }, relations: { artist: true } });
    if (!artwork) {
      throw new NotFoundException(`Œuvre d'art avec l'ID ${id} non trouvée`);
    }
    return artwork;
  }

  async update(id: string, updateArtworkDto: UpdateArtworkDto): Promise<Artwork> {
    const artwork = await this.findOne(id);
    Object.assign(artwork, updateArtworkDto);
    return this.artworkRepository.save(artwork);
  }

  async remove(id: string): Promise<void> {
    const artwork = await this.findOne(id);
    await this.artworkRepository.remove(artwork);
  }
}
