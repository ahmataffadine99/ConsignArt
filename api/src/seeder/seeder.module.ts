import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { UsersModule } from '../modules/users/users.module';
import { ArtistsModule } from '../modules/artists/artists.module';
import { ArtworksModule } from '../modules/artworks/artworks.module';
import { SalesModule } from '../modules/sales/sales.module';
import { ExhibitionsModule } from '../modules/exhibitions/exhibitions.module';

@Module({
  imports: [UsersModule, ArtistsModule, ArtworksModule, SalesModule, ExhibitionsModule],
  providers: [SeederService],
})
export class SeederModule {}
