import { ApiProperty } from '@nestjs/swagger';

export class SalesPerMonthDto {
  @ApiProperty({ example: '2026-06' })
  month: string;

  @ApiProperty({ example: 5 })
  totalSales: number;

  @ApiProperty({ example: 25000.00 })
  revenue: number;
}

export class TopArtistDto {
  @ApiProperty({ example: 'uuid-artist-id' })
  artistId: string;

  @ApiProperty({ example: 'Pablo Picasso' })
  artistName: string;

  @ApiProperty({ example: 8 })
  totalSales: number;

  @ApiProperty({ example: 120000.00 })
  totalRevenue: number;
}

export class GalleryReportDto {
  @ApiProperty({ type: [SalesPerMonthDto] })
  salesPerMonth: SalesPerMonthDto[];

  @ApiProperty({ example: 250000.00 })
  totalRevenue: number;

  @ApiProperty({ example: 45000.00 })
  totalCommissions: number;

  @ApiProperty({ type: [TopArtistDto] })
  topArtists: TopArtistDto[];

  @ApiProperty({ example: 0.65 })
  rotationRate: number;
}

export class ArtistReportDto {
  @ApiProperty({ example: 12 })
  totalSales: number;

  @ApiProperty({ example: 48000.00 })
  totalRevenue: number;

  @ApiProperty({ example: 19200.00 })
  totalCommissions: number;

  @ApiProperty({ example: 3 })
  availableArtworks: number;
}

export class AdminReportDto {
  @ApiProperty({ example: 42 })
  activeUsers: number;

  @ApiProperty({ example: 320000.00 })
  totalTransactionVolume: number;

  @ApiProperty({ example: 96000.00 })
  totalCommissions: number;

  @ApiProperty({ example: 28 })
  totalSales: number;
}
