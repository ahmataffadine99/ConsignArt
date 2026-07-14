import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtworksService } from './artworks.service';
import { ArtworksController } from './artworks.controller';
import { Artwork } from './entities/artwork.entity';
import { ArtworkStatusHistory } from './entities/artwork-status-history.entity';
import { Artist } from '../artists/entities/artist.entity';
import { ArtworkStatusHistoryService } from './artwork-status-history.service';

@Module({
  imports: [TypeOrmModule.forFeature([Artwork, ArtworkStatusHistory, Artist])],
  controllers: [ArtworksController],
  providers: [ArtworksService, ArtworkStatusHistoryService],
  exports: [ArtworksService, ArtworkStatusHistoryService],
})
export class ArtworksModule {}
