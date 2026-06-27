import { DataSource } from 'typeorm';
import { User } from '../modules/users/entities/user.entity';
import { Artist } from '../modules/artists/entities/artist.entity';
import { Artwork } from '../modules/artworks/entities/artwork.entity';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Charge les variables d'environnement depuis le fichier .env
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  // On utilise localhost pour le CLI s'il est lancé en dehors de Docker
  host: process.env.DB_HOST === 'db' ? 'localhost' : process.env.DB_HOST || 'localhost',
  port: 5432,
  username: process.env.DB_USERNAME || 'consignart_user',
  password: process.env.DB_PASSWORD || 'consignart_pass',
  database: process.env.DB_DATABASE || 'consignart',
  entities: [User, Artist, Artwork],
  migrations: [join(__dirname, '..', 'migrations', '*.ts')],
  synchronize: false,
});
