import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { UsersService } from '../modules/users/users.service';
import { ArtistsService } from '../modules/artists/artists.service';
import { ArtworksService } from '../modules/artworks/artworks.service';
import { Role } from '../modules/users/enums/role.enum';
import { ArtworkStatus } from '../modules/artworks/enums/artwork-status.enum';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly artistsService: ArtistsService,
    private readonly artworksService: ArtworksService,
  ) {}

  async onModuleInit() {
    this.logger.log('Vérification de la base de données pour insérer des fixtures...');

    // 1. Vérifier si l'admin existe (si oui, on skip tout)
    const adminExists = await this.usersService.findByEmail('admin@consignart.com');
    if (adminExists) {
      this.logger.log('Base de données déjà peuplée (Admin existant).');
      return;
    }

    // 2. Création des Users
    this.logger.log('Création des utilisateurs de test...');
    
    await this.usersService.create({
      email: 'admin@consignart.com',
      password: 'password123',
      role: Role.ADMIN,
    });

    await this.usersService.create({
      email: 'gallery@consignart.com',
      password: 'password123',
      role: Role.GALLERY,
    });

    await this.usersService.create({
      email: 'collector@consignart.com',
      password: 'password123',
      role: Role.COLLECTOR,
    });

    const userPicasso = await this.usersService.create({
      email: 'picasso@consignart.com',
      password: 'password123',
      role: Role.ARTIST,
    });

    const userDali = await this.usersService.create({
      email: 'dali@consignart.com',
      password: 'password123',
      role: Role.ARTIST,
    });

    // 3. Création des profils Artistes
    this.logger.log('Création des profils artistes...');
    
    await this.artistsService.create(userPicasso.id, {
      biography: 'Peintre espagnol, pionnier du cubisme.',
      nationality: 'Espagnole',
    });

    await this.artistsService.create(userDali.id, {
      biography: 'Artiste surréaliste excentrique.',
      nationality: 'Espagnole',
    });

    // 4. Création des Œuvres
    this.logger.log('Création des œuvres d\'art...');
    
    await this.artworksService.create(userPicasso.id, {
      title: 'Guernica',
      description: 'Célèbre peinture murale cubiste',
      price: 5000000,
      status: ArtworkStatus.RESERVED,
    });

    await this.artworksService.create(userPicasso.id, {
      title: 'Les Demoiselles d\'Avignon',
      description: 'Œuvre fondatrice du cubisme',
      price: 2000000,
      status: ArtworkStatus.AVAILABLE,
    });

    await this.artworksService.create(userDali.id, {
      title: 'La Persistance de la mémoire',
      description: 'Les fameuses montres molles',
      price: 3500000,
      status: ArtworkStatus.AVAILABLE,
    });

    this.logger.log('Fixtures insérées avec succès !');
  }
}
