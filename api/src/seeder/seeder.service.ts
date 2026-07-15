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

    // 4. Création des Œuvres
    this.logger.log('Création des œuvres d\'art...');
    
    const aw1 = await this.artworksService.create({ userId: userPicasso.id, role: 'artist' }, {
      title: 'Guernica',
      description: 'Célèbre peinture murale cubiste',
      year: 1937,
      technique: 'Huile sur toile',
      dimensions: { hauteur: 349, largeur: 776 },
      price: 5000000,
      reservePrice: 4000000,
      status: ArtworkStatus.AVAILABLE,
      artistId: userPicasso.id,
    });

    const aw2 = await this.artworksService.create({ userId: userPicasso.id, role: 'artist' }, {
      title: 'Les Demoiselles d\'Avignon',
      description: 'Œuvre fondatrice du cubisme',
      year: 1907,
      technique: 'Huile sur toile',
      dimensions: { hauteur: 243, largeur: 233 },
      price: 2000000,
      reservePrice: 1500000,
      status: ArtworkStatus.AVAILABLE,
      artistId: userPicasso.id,
    });

    const aw3 = await this.artworksService.create({ userId: userDali.id, role: 'artist' }, {
      title: 'La Persistance de la mémoire',
      description: 'Les fameuses montres molles',
      year: 1931,
      technique: 'Huile sur toile',
      dimensions: { hauteur: 24, largeur: 33 },
      price: 3500000,
      reservePrice: 3000000,
      status: ArtworkStatus.AVAILABLE,
      artistId: userDali.id,
    });

    const aw4 = await this.artworksService.create({ userId: userDali.id, role: 'artist' }, {
      title: 'Le Grand Masturbateur',
      description: 'Œuvre surréaliste',
      year: 1929,
      technique: 'Huile sur toile',
      dimensions: { hauteur: 110, largeur: 150 },
      price: 1500000,
      reservePrice: 1000000,
      status: ArtworkStatus.AVAILABLE,
      artistId: userDali.id,
    });

    const aw5 = await this.artworksService.create({ userId: userPicasso.id, role: 'artist' }, {
      title: 'Le Rêve',
      description: 'Portrait de Marie-Thérèse Walter',
      year: 1932,
      technique: 'Huile sur toile',
      dimensions: { hauteur: 130, largeur: 97 },
      price: 8000000,
      reservePrice: 7000000,
      status: ArtworkStatus.AVAILABLE,
      artistId: userPicasso.id,
    });

    const aw6 = await this.artworksService.create({ userId: userPicasso.id, role: 'artist' }, {
      title: 'La Femme qui pleure',
      description: 'Représentation de Dora Maar',
      year: 1937,
      technique: 'Huile sur toile',
      dimensions: { hauteur: 60, largeur: 49 },
      price: 4500000,
      reservePrice: 4000000,
      status: ArtworkStatus.AVAILABLE,
      artistId: userPicasso.id,
    });

    // 5. Création des Ventes
    this.logger.log('Création des ventes...');
    await this.salesService.create({
      artworkId: aw1.id,
      buyerId: userCollector.id,
      salePrice: 5200000,
    });

    await this.salesService.create({
      artworkId: aw3.id,
      buyerId: userCollector.id,
      salePrice: 3600000,
    });

    await this.salesService.create({
      artworkId: aw4.id,
      buyerId: userCollector.id,
      salePrice: 1600000,
    });

    // 6. Création des Expositions
    this.logger.log('Création des expositions...');
    await this.exhibitionsService.create(userGallery.id, {
      name: 'Les Maîtres du 20ème siècle',
      startDate: '2026-09-01T00:00:00Z',
      endDate: '2026-10-31T00:00:00Z',
      location: 'Grand Palais, Paris',
      artworkIds: [aw2.id, aw5.id],
    });

    await this.exhibitionsService.create(userGallery.id, {
      name: 'Rétrospective Picasso Virtuelle',
      startDate: '2026-11-01T00:00:00Z',
      endDate: '2026-12-31T00:00:00Z',
      virtualLink: 'https://virtual.consignart.com/picasso',
      artworkIds: [aw6.id],
    });

    this.logger.log('Fixtures insérées avec succès !');
  }
}
