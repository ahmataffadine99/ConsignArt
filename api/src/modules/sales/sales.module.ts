import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { Sale } from './entities/sale.entity';
import { Invoice } from './entities/invoice.entity';
import { Artwork } from '../artworks/entities/artwork.entity';
import { User } from '../users/entities/user.entity';
import { ArtworksModule } from '../artworks/artworks.module';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, Invoice, Artwork, User]), ArtworksModule],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
