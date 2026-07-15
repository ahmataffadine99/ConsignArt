import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from '../sales/entities/sale.entity';
import { Artwork } from '../artworks/entities/artwork.entity';
import { User } from '../users/entities/user.entity';
import { Artist } from '../artists/entities/artist.entity';
import { ArtworkStatus } from '../artworks/enums/artwork-status.enum';
import { Role } from '../users/enums/role.enum';
import {
  GalleryReportDto,
  ArtistReportDto,
  AdminReportDto,
  SalesPerMonthDto,
  TopArtistDto,
} from './dto/report-response.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(Artwork)
    private readonly artworkRepository: Repository<Artwork>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Artist)
    private readonly artistRepository: Repository<Artist>,
  ) {}

  async getGalleryReport(galleryId: string): Promise<GalleryReportDto> {
    const gallery = await this.userRepository.findOne({ where: { id: galleryId } });
    if (!gallery || gallery.role !== Role.GALLERY) {
      throw new NotFoundException(`Gallery with id ${galleryId} not found`);
    }

    const sales = await this.saleRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.artwork', 'artwork')
      .leftJoinAndSelect('artwork.artist', 'artist')
      .where('artist.galleryId = :galleryId', { galleryId })
      .getMany();

    const allArtworks = await this.artworkRepository
      .createQueryBuilder('artwork')
      .leftJoin('artwork.artist', 'artist')
      .where('artist.galleryId = :galleryId', { galleryId })
      .getMany();

    const salesPerMonthMap = new Map<string, { totalSales: number; revenue: number }>();
    for (const sale of sales) {
      const month = sale.saleDate.toISOString().slice(0, 7);
      const existing = salesPerMonthMap.get(month) ?? { totalSales: 0, revenue: 0 };
      salesPerMonthMap.set(month, {
        totalSales: existing.totalSales + 1,
        revenue: existing.revenue + Number(sale.salePrice),
      });
    }

    const salesPerMonth: SalesPerMonthDto[] = Array.from(salesPerMonthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, ...data }));

    const totalRevenue = sales.reduce((sum, s) => sum + Number(s.salePrice), 0);

    const artistSalesMap = new Map<string, { artistName: string; totalSales: number; totalRevenue: number }>();
    for (const sale of sales) {
      const artist = sale.artwork?.artist;
      if (!artist) continue;
      const existing = artistSalesMap.get(artist.id) ?? {
        artistName: `${artist.firstName} ${artist.lastName}`,
        totalSales: 0,
        totalRevenue: 0,
      };
      artistSalesMap.set(artist.id, {
        ...existing,
        totalSales: existing.totalSales + 1,
        totalRevenue: existing.totalRevenue + Number(sale.salePrice),
      });
    }

    const topArtists: TopArtistDto[] = Array.from(artistSalesMap.entries())
      .map(([artistId, data]) => ({ artistId, ...data }))
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 5);

    const soldCount = allArtworks.filter((a) => a.status === ArtworkStatus.SOLD).length;
    const rotationRate = allArtworks.length > 0
      ? Number((soldCount / allArtworks.length).toFixed(2))
      : 0;

    return { salesPerMonth, totalRevenue, topArtists, rotationRate };
  }

  async getArtistReport(artistUserId: string): Promise<ArtistReportDto> {
    const artist = await this.artistRepository.findOne({ where: { userId: artistUserId } });
    if (!artist) {
      throw new NotFoundException(`Artist profile not found for user ${artistUserId}`);
    }

    const sales = await this.saleRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.artwork', 'artwork')
      .where('artwork.artistId = :artistId', { artistId: artist.id })
      .getMany();

    const totalRevenue = sales.reduce((sum, s) => sum + Number(s.salePrice), 0);
    const totalCommissions = sales.reduce((sum, s) => sum + Number(s.commissionAmount), 0);

    const availableArtworks = await this.artworkRepository.count({
      where: { artistId: artist.id, status: ArtworkStatus.AVAILABLE },
    });

    return {
      totalSales: sales.length,
      totalRevenue,
      totalCommissions,
      availableArtworks,
    };
  }

  async getAdminReport(): Promise<AdminReportDto> {
    const activeUsers = await this.userRepository.count({ where: { isActive: true } });

    const sales = await this.saleRepository.find();

    const totalTransactionVolume = sales.reduce((sum, s) => sum + Number(s.salePrice), 0);
    const totalCommissions = sales.reduce((sum, s) => sum + Number(s.commissionAmount), 0);

    return {
      activeUsers,
      totalTransactionVolume,
      totalCommissions,
      totalSales: sales.length,
    };
  }
}
