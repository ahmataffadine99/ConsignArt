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

  async create(userId: string, createArtworkDto: CreateArtworkDto): Promise<Artwork> {
    // 1. Trouver le profil artiste de cet utilisateur
    const artist = await this.artistRepository.findOne({ where: { userId } });
    if (!artist) {
      throw new BadRequestException("Vous devez d'abord créer un profil artiste.");
    }

    const artwork = this.artworkRepository.create({
      ...createArtworkDto,
      artistId: artist.id,
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
