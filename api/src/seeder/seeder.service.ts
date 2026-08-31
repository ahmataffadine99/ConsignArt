import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { UsersService } from '../modules/users/users.service';
import { ArtistsService } from '../modules/artists/artists.service';
import { ArtworksService } from '../modules/artworks/artworks.service';
import { SalesService } from '../modules/sales/sales.service';
import { ExhibitionsService } from '../modules/exhibitions/exhibitions.service';
import { Role } from '../modules/users/enums/role.enum';
import { ArtworkStatus } from '../modules/artworks/enums/artwork-status.enum';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly artistsService: ArtistsService,
    private readonly artworksService: ArtworksService,
    private readonly salesService: SalesService,
    private readonly exhibitionsService: ExhibitionsService,
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

    const userGallery = await this.usersService.create({
      email: 'gallery@consignart.com',
      password: 'password123',
      role: Role.GALLERY,
    });

    const userGallery2 = await this.usersService.create({
      email: 'gallery2@consignart.com',
      password: 'password123',
      role: Role.GALLERY,
    });

    const userCollector = await this.usersService.create({
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
      firstName: 'Pablo',
      lastName: 'Picasso',
      biography: 'Peintre espagnol, pionnier du cubisme.',
      nationality: 'Espagnole',
      galleryId: userGallery.id,
    });

    await this.artistsService.create(userDali.id, {
      firstName: 'Salvador',
      lastName: 'Dali',
      biography: 'Artiste surréaliste excentrique.',
      nationality: 'Espagnole',
      galleryId: userGallery.id,
    });

    // 4. Création des Œuvres (Réactivées pour te simplifier le test)
    this.logger.log('Création des œuvres d\'art...');
    
    // Œuvre 1 : Prix bas pour tester la commission de 40% (<= 5000)
    const aw1 = await this.artworksService.create({ userId: userPicasso.id, role: 'artist' }, {
      title: 'Petite Étude Cubiste',
      description: 'Idéal pour montrer la commission de 40%',
      year: 1937,
      technique: 'Crayon',
      price: 1000,
      reservePrice: 800,
      status: ArtworkStatus.AVAILABLE,
      artistId: userPicasso.id,
      imageUrl: '/images/cubist.png',
    });

    // Œuvre 2 : Prix moyen pour tester la commission de 35% (<= 20000)
    const aw2 = await this.artworksService.create({ userId: userPicasso.id, role: 'artist' }, {
      title: 'Portrait Moyen',
      description: 'Idéal pour montrer la commission de 35%',
      year: 1940,
      technique: 'Huile',
      price: 10000,
      reservePrice: 8000,
      status: ArtworkStatus.AVAILABLE,
      artistId: userPicasso.id,
      imageUrl: '/images/portrait.png',
    });

    // Œuvre 3 : Prix haut pour tester la commission de 30% (> 20000)
    const aw3 = await this.artworksService.create({ userId: userDali.id, role: 'artist' }, {
      title: 'Grande Toile Surréaliste',
      description: 'Idéal pour tester l\'achat en direct à 30% de commission',
      year: 1931,
      technique: 'Huile',
      price: 30000,
      reservePrice: 25000,
      status: ArtworkStatus.AVAILABLE,
      artistId: userDali.id,
      imageUrl: '/images/surreal.png',
    });

    // Œuvre 4 : Pour tester les prêts
    const aw4 = await this.artworksService.create({ userId: userDali.id, role: 'artist' }, {
      title: 'Sculpture Bronze',
      description: 'Idéal pour montrer le système de prêt',
      year: 1950,
      technique: 'Bronze',
      price: 15000,
      reservePrice: 12000,
      status: ArtworkStatus.AVAILABLE,
      artistId: userDali.id,
      imageUrl: '/images/bronze.png',
    });

    this.logger.log('Fixtures (Comptes et Œuvres) insérées avec succès ! Les Ventes et Prêts restent vides pour tes tests.');
  }
}
