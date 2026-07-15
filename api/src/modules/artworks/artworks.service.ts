import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateArtworkDto } from './dto/create-artwork.dto';
import { UpdateArtworkDto } from './dto/update-artwork.dto';
import { Artwork } from './entities/artwork.entity';
import { Artist } from '../artists/entities/artist.entity';
import { ArtworkStatusHistoryService } from './artwork-status-history.service';
import { ArtworkStatus } from './enums/artwork-status.enum';

@Injectable()
export class ArtworksService {
  constructor(
    @InjectRepository(Artwork)
    private readonly artworkRepository: Repository<Artwork>,
    @InjectRepository(Artist)
    private readonly artistRepository: Repository<Artist>,
    private readonly historyService: ArtworkStatusHistoryService,
    private readonly dataSource: DataSource,
  ) {}

  async create(user: any, createArtworkDto: CreateArtworkDto): Promise<Artwork> {
    let artistId = createArtworkDto.artistId;

    if (user.role === 'artist') {
      const artist = await this.artistRepository.findOne({ where: { userId: user.userId } });
      if (!artist) {
        throw new BadRequestException('Artist profile not found for this user.');
      }
      artistId = artist.id;
    } else if (user.role === 'gallery') {
      if (!artistId) {
        throw new BadRequestException('artistId is required when a gallery creates an artwork.');
      }
      const artist = await this.artistRepository.findOne({ where: { id: artistId, galleryId: user.userId } });
      if (!artist) {
        throw new BadRequestException('This artist does not belong to your gallery.');
      }
    } else {
      throw new BadRequestException('Your role is not allowed to create an artwork.');
    }

    const activeArtworksCount = await this.artworkRepository.count({
      where: [
        { artistId, status: ArtworkStatus.AVAILABLE },
        { artistId, status: ArtworkStatus.ON_LOAN },
      ],
    });

    if (activeArtworksCount >= 50) {
      throw new BadRequestException('This artist has reached the limit of 50 active artworks.');
    }

    return this.dataSource.transaction(async (manager) => {
      const initialStatus = createArtworkDto.status ?? ArtworkStatus.AVAILABLE;
      const artwork = manager.create(Artwork, { ...createArtworkDto, artistId, status: initialStatus });
      const saved = await manager.save(Artwork, artwork);
      await this.historyService.record(manager, saved.id, null, initialStatus, user.userId);
      return saved;
    });
  }

  findAll(): Promise<Artwork[]> {
    return this.artworkRepository.find({ relations: { artist: true } });
  }

  async findOne(id: string): Promise<Artwork> {
    const artwork = await this.artworkRepository.findOne({ where: { id }, relations: { artist: true } });
    if (!artwork) {
      throw new NotFoundException(`Artwork with id ${id} not found`);
    }
    return artwork;
  }

  async update(id: string, updateArtworkDto: UpdateArtworkDto, userId?: string): Promise<Artwork> {
    const artwork = await this.findOne(id);
    const oldStatus = artwork.status;
    Object.assign(artwork, updateArtworkDto);

    if (updateArtworkDto.status && updateArtworkDto.status !== oldStatus) {
      return this.dataSource.transaction(async (manager) => {
        const saved = await manager.save(Artwork, artwork);
        await this.historyService.record(manager, id, oldStatus, updateArtworkDto.status!, userId);
        return saved;
      });
    }

    return this.artworkRepository.save(artwork);
  }

  async remove(id: string): Promise<void> {
    const artwork = await this.findOne(id);
    await this.artworkRepository.remove(artwork);
  }
}
