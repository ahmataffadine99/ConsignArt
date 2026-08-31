import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Sale } from '../sales/entities/sale.entity';
import { Artwork } from '../artworks/entities/artwork.entity';
import { User } from '../users/entities/user.entity';
import { Artist } from '../artists/entities/artist.entity';
import { Role } from '../users/enums/role.enum';
import { ArtworkStatus } from '../artworks/enums/artwork-status.enum';

describe('ReportsService', () => {
  let service: ReportsService;

  const mockSaleRepo = {
    createQueryBuilder: jest.fn(),
    find: jest.fn(),
  };

  const mockArtworkRepo = {
    createQueryBuilder: jest.fn(),
    count: jest.fn(),
  };

  const mockUserRepo = {
    findOne: jest.fn(),
    count: jest.fn(),
  };

  const mockArtistRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: getRepositoryToken(Sale), useValue: mockSaleRepo },
        { provide: getRepositoryToken(Artwork), useValue: mockArtworkRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: getRepositoryToken(Artist), useValue: mockArtistRepo },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getGalleryReport', () => {
    it('should calculate revenue, commissions and rotation rate correctly', async () => {
      // Mock user (Gallery)
      mockUserRepo.findOne.mockResolvedValue({ id: 'gal1', role: Role.GALLERY });

      // Mock sales builder
      const mockSales = [
        { salePrice: 1000, commissionAmount: 400, saleDate: new Date('2026-08-01') },
        { salePrice: 10000, commissionAmount: 3500, saleDate: new Date('2026-08-05') },
      ];
      mockSaleRepo.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockSales),
      });

      // Mock artworks builder
      const mockArtworks = [
        { status: ArtworkStatus.SOLD },
        { status: ArtworkStatus.SOLD },
        { status: ArtworkStatus.AVAILABLE },
        { status: ArtworkStatus.ON_LOAN },
      ];
      mockArtworkRepo.createQueryBuilder.mockReturnValue({
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockArtworks),
      });

      const report = await service.getGalleryReport('gal1');

      expect(report.totalRevenue).toBe(11000); // 1000 + 10000
      expect(report.totalCommissions).toBe(3900); // 400 + 3500
      expect(report.rotationRate).toBe(0.5); // 2 SOLD out of 4 total artworks
    });
  });

  describe('getAdminReport', () => {
    it('should aggregate global stats correctly', async () => {
      mockUserRepo.count.mockResolvedValue(10);
      mockSaleRepo.find.mockResolvedValue([
        { salePrice: 1000, commissionAmount: 400 },
        { salePrice: 5000, commissionAmount: 2000 },
      ]);

      const report = await service.getAdminReport();

      expect(report.activeUsers).toBe(10);
      expect(report.totalSales).toBe(2);
      expect(report.totalTransactionVolume).toBe(6000);
      expect(report.totalCommissions).toBe(2400);
    });
  });
});
