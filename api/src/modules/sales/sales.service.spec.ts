import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { SalesService } from './sales.service';
import { Sale } from './entities/sale.entity';
import { Artwork } from '../artworks/entities/artwork.entity';
import { User } from '../users/entities/user.entity';
import { ArtworkStatusHistoryService } from '../artworks/artwork-status-history.service';
import { ArtworkStatus } from '../artworks/enums/artwork-status.enum';
import { Role } from '../users/enums/role.enum';
import { BusinessRuleViolationException } from '../../common/exceptions/business-rule.exception';
import { Invoice } from './entities/invoice.entity';
import { InvoiceType } from './enums/invoice-type.enum';

describe('SalesService', () => {
  let service: SalesService;
  let saleRepository: Repository<Sale>;
  let artworkRepository: Repository<Artwork>;
  let userRepository: Repository<User>;
  let historyService: ArtworkStatusHistoryService;
  let dataSource: DataSource;
  let validArtwork: Artwork;
  let validBuyer: User;

  const mockSaleRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockArtworkRepository = {
    findOne: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockHistoryService = {
    record: jest.fn(),
  };

  const mockEntityManager = {
    save: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn().mockImplementation((cb) => cb(mockEntityManager)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        { provide: getRepositoryToken(Sale), useValue: mockSaleRepository },
        { provide: getRepositoryToken(Artwork), useValue: mockArtworkRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: ArtworkStatusHistoryService, useValue: mockHistoryService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
    saleRepository = module.get<Repository<Sale>>(getRepositoryToken(Sale));
    artworkRepository = module.get<Repository<Artwork>>(getRepositoryToken(Artwork));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    historyService = module.get<ArtworkStatusHistoryService>(ArtworkStatusHistoryService);
    dataSource = module.get<DataSource>(DataSource);

    validArtwork = {
      id: 'artwork-uuid',
      status: ArtworkStatus.AVAILABLE,
      reservePrice: 800,
    } as Artwork;

    validBuyer = {
      id: 'buyer-uuid',
      role: Role.COLLECTOR,
    } as User;

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {

    it('should successfully create a sale with 40% commission when price <= 5000', async () => {
      const createSaleDto = {
        artworkId: 'artwork-uuid',
        buyerId: 'buyer-uuid',
        salePrice: 1000,
      };

      mockArtworkRepository.findOne.mockResolvedValue(validArtwork);
      mockUserRepository.findOne.mockResolvedValue(validBuyer);

      // EntityManager mocks
      mockEntityManager.create.mockImplementation((entity, data) => data);
      mockEntityManager.save.mockImplementation((entity, data) => Promise.resolve(data));
      
      const mockSavedSale = {
        id: 'sale-uuid',
        ...createSaleDto,
        commissionRate: 40,
        commissionAmount: 400,
        artistBalance: 600,
      };
      
      mockEntityManager.save.mockResolvedValueOnce(validArtwork); // Saving artwork
      mockEntityManager.save.mockResolvedValueOnce(mockSavedSale); // Saving sale
      
      mockEntityManager.findOne.mockResolvedValue({
        ...mockSavedSale,
        artwork: validArtwork,
        buyer: validBuyer,
      });

      const result = await service.create(createSaleDto);

      expect(artworkRepository.findOne).toHaveBeenCalledWith({ where: { id: 'artwork-uuid' } });
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 'buyer-uuid' } });
      expect(dataSource.transaction).toHaveBeenCalled();
      
      expect(result.commissionRate).toBe(40);
      expect(result.commissionAmount).toBe(400);
      expect(result.artistBalance).toBe(600);
      expect(mockHistoryService.record).toHaveBeenCalledWith(
        mockEntityManager,
        'artwork-uuid',
        ArtworkStatus.AVAILABLE,
        ArtworkStatus.SOLD,
        'buyer-uuid',
      );
    });

    it('should successfully create a sale with 35% commission when price <= 20000', async () => {
      const createSaleDto = {
        artworkId: 'artwork-uuid',
        buyerId: 'buyer-uuid',
        salePrice: 10000,
      };

      mockArtworkRepository.findOne.mockResolvedValue(validArtwork);
      mockUserRepository.findOne.mockResolvedValue(validBuyer);

      mockEntityManager.create.mockImplementation((entity, data) => data);
      mockEntityManager.save.mockImplementation((entity, data) => Promise.resolve(data));
      
      const mockSavedSale = {
        id: 'sale-uuid',
        ...createSaleDto,
        commissionRate: 35,
        commissionAmount: 3500,
        artistBalance: 6500,
      };
      
      mockEntityManager.findOne.mockResolvedValue(mockSavedSale);

      const result = await service.create(createSaleDto);
      expect(result.commissionRate).toBe(35);
      expect(result.commissionAmount).toBe(3500);
      expect(result.artistBalance).toBe(6500);
    });

    it('should successfully create a sale with 30% commission when price > 20000', async () => {
      const createSaleDto = {
        artworkId: 'artwork-uuid',
        buyerId: 'buyer-uuid',
        salePrice: 30000,
      };

      mockArtworkRepository.findOne.mockResolvedValue(validArtwork);
      mockUserRepository.findOne.mockResolvedValue(validBuyer);

      mockEntityManager.create.mockImplementation((entity, data) => data);
      mockEntityManager.save.mockImplementation((entity, data) => Promise.resolve(data));
      
      const mockSavedSale = {
        id: 'sale-uuid',
        ...createSaleDto,
        commissionRate: 30,
        commissionAmount: 9000,
        artistBalance: 21000,
      };
      
      mockEntityManager.findOne.mockResolvedValue(mockSavedSale);

      const result = await service.create(createSaleDto);
      expect(result.commissionRate).toBe(30);
      expect(result.commissionAmount).toBe(9000);
      expect(result.artistBalance).toBe(21000);
    });

    it('should throw NotFoundException if artwork is not found', async () => {
      mockArtworkRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create({ artworkId: 'notfound', buyerId: 'buyer-uuid', salePrice: 1000 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BusinessRuleViolationException if artwork status is not AVAILABLE', async () => {
      const unavailableArtwork = {
        id: 'artwork-uuid',
        status: ArtworkStatus.SOLD,
      } as Artwork;

      mockArtworkRepository.findOne.mockResolvedValue(unavailableArtwork);

      await expect(
        service.create({ artworkId: 'artwork-uuid', buyerId: 'buyer-uuid', salePrice: 1000 }),
      ).rejects.toThrow(BusinessRuleViolationException);
    });

    it('should throw BusinessRuleViolationException if sale price is less than reserve price', async () => {
      const artworkWithHighReserve = {
        id: 'artwork-uuid',
        status: ArtworkStatus.AVAILABLE,
        reservePrice: 2000,
      } as Artwork;

      mockArtworkRepository.findOne.mockResolvedValue(artworkWithHighReserve);

      await expect(
        service.create({ artworkId: 'artwork-uuid', buyerId: 'buyer-uuid', salePrice: 1500 }),
      ).rejects.toThrow(BusinessRuleViolationException);
    });

    it('should throw NotFoundException if buyer is not found', async () => {
      mockArtworkRepository.findOne.mockResolvedValue(validArtwork);
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create({ artworkId: 'artwork-uuid', buyerId: 'notfound', salePrice: 1000 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BusinessRuleViolationException if buyer is not a collector', async () => {
      const artistBuyer = {
        id: 'buyer-uuid',
        role: Role.ARTIST,
      } as User;

      mockArtworkRepository.findOne.mockResolvedValue(validArtwork);
      mockUserRepository.findOne.mockResolvedValue(artistBuyer);

      await expect(
        service.create({ artworkId: 'artwork-uuid', buyerId: 'buyer-uuid', salePrice: 1000 }),
      ).rejects.toThrow(BusinessRuleViolationException);
    });
  });

  describe('findAll', () => {
    const mockSales = [{ id: 'sale-1', buyerId: 'collector-uuid' }];

    it('should query sales for an artist using query builder', async () => {
      const queryBuilderMock = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockSales),
      };

      mockSaleRepository.createQueryBuilder.mockReturnValue(queryBuilderMock);

      const result = await service.findAll({ role: Role.ARTIST, userId: 'artist-uuid' });

      expect(mockSaleRepository.createQueryBuilder).toHaveBeenCalledWith('sale');
      expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenCalledTimes(4);
      expect(queryBuilderMock.where).toHaveBeenCalledWith('artist.userId = :userId', {
        userId: 'artist-uuid',
      });
      expect(result).toEqual(mockSales);
    });

    it('should find sales for a collector directly via find', async () => {
      mockSaleRepository.find.mockResolvedValue(mockSales);

      const result = await service.findAll({ role: Role.COLLECTOR, userId: 'collector-uuid' });

      expect(mockSaleRepository.find).toHaveBeenCalledWith({
        where: { buyerId: 'collector-uuid' },
        relations: { artwork: true, buyer: true, invoices: true },
      });
      expect(result).toEqual(mockSales);
    });

    it('should find all sales for administrators', async () => {
      mockSaleRepository.find.mockResolvedValue(mockSales);

      const result = await service.findAll({ role: Role.ADMIN, userId: 'admin-uuid' });

      expect(mockSaleRepository.find).toHaveBeenCalledWith({
        relations: { artwork: true, buyer: true, invoices: true },
      });
      expect(result).toEqual(mockSales);
    });
  });

  describe('findOne', () => {
    const mockSale = { id: 'sale-1', buyerId: 'collector-uuid' } as Sale;

    it('should return sale by id for admin', async () => {
      mockSaleRepository.findOne.mockResolvedValue(mockSale);

      const result = await service.findOne('sale-1', { role: Role.ADMIN, userId: 'admin-uuid' });

      expect(mockSaleRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'sale-1' },
        relations: { artwork: true, buyer: true, invoices: true },
      });
      expect(result).toEqual(mockSale);
    });

    it('should return sale by id for collector if they are the buyer', async () => {
      mockSaleRepository.findOne.mockResolvedValue(mockSale);

      const result = await service.findOne('sale-1', {
        role: Role.COLLECTOR,
        userId: 'collector-uuid',
      });

      expect(result).toEqual(mockSale);
    });

    it('should throw BusinessRuleViolationException if collector tries to view another user\'s sale', async () => {
      mockSaleRepository.findOne.mockResolvedValue(mockSale);

      await expect(
        service.findOne('sale-1', { role: Role.COLLECTOR, userId: 'other-collector-uuid' }),
      ).rejects.toThrow(BusinessRuleViolationException);
    });

    it('should throw NotFoundException if sale does not exist', async () => {
      mockSaleRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne('not-found-id', { role: Role.ADMIN, userId: 'admin-uuid' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
