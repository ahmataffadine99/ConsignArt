import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExhibitionsService } from './exhibitions.service';
import { ExhibitionsController } from './exhibitions.controller';
import { Exhibition } from './entities/exhibition.entity';
import { Loan } from './entities/loan.entity';
import { Artwork } from '../artworks/entities/artwork.entity';
import { ArtworksModule } from '../artworks/artworks.module';

@Module({
  imports: [TypeOrmModule.forFeature([Exhibition, Loan, Artwork]), ArtworksModule],
  controllers: [ExhibitionsController],
  providers: [ExhibitionsService],
  exports: [ExhibitionsService],
})
export class ExhibitionsModule {}
