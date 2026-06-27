import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { UsersModule } from '../modules/users/users.module';
import { ArtistsModule } from '../modules/artists/artists.module';
import { ArtworksModule } from '../modules/artworks/artworks.module';

@Module({
  imports: [UsersModule, ArtistsModule, ArtworksModule],
  providers: [SeederService],
})
export class SeederModule {}
