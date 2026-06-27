import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { Artist } from './entities/artist.entity';

@Injectable()
export class ArtistsService {
  constructor(
    @InjectRepository(Artist)
    private readonly artistRepository: Repository<Artist>,
  ) {}

  async create(userId: string, createArtistDto: CreateArtistDto): Promise<Artist> {
    const artist = this.artistRepository.create({
      ...createArtistDto,
      userId,
    });
    return this.artistRepository.save(artist);
  }

  findAll(): Promise<Artist[]> {
    return this.artistRepository.find({ relations: { user: true } });
  }

  async findOne(id: string): Promise<Artist> {
    const artist = await this.artistRepository.findOne({ where: { id }, relations: { user: true } });
    if (!artist) {
      throw new NotFoundException(`Artiste avec l'ID ${id} non trouvé`);
    }
    return artist;
  }

  async findByUserId(userId: string): Promise<Artist | null> {
    return this.artistRepository.findOne({ where: { userId } });
  }

  async update(id: string, updateArtistDto: UpdateArtistDto): Promise<Artist> {
    const artist = await this.findOne(id);
    Object.assign(artist, updateArtistDto);
    return this.artistRepository.save(artist);
  }

  async remove(id: string): Promise<void> {
    const artist = await this.findOne(id);
    await this.artistRepository.remove(artist);
  }
}
