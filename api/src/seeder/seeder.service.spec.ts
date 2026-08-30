import { Test, TestingModule } from '@nestjs/testing';
import { SeederService } from './seeder.service';
import { UsersService } from '../modules/users/users.service';
import { ArtistsService } from '../modules/artists/artists.service';
import { ArtworksService } from '../modules/artworks/artworks.service';
import { SalesService } from '../modules/sales/sales.service';
import { ExhibitionsService } from '../modules/exhibitions/exhibitions.service';

describe('SeederService', () => {
  let service: SeederService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };
  const mockArtistsService = {
    create: jest.fn(),
  };
  const mockArtworksService = {
    create: jest.fn(),
  };
  const mockSalesService = {
    create: jest.fn(),
  };
  const mockExhibitionsService = {
    create: jest.fn(),
    createLoan: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeederService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: ArtistsService, useValue: mockArtistsService },
        { provide: ArtworksService, useValue: mockArtworksService },
        { provide: SalesService, useValue: mockSalesService },
        { provide: ExhibitionsService, useValue: mockExhibitionsService },
      ],
    }).compile();

    service = module.get<SeederService>(SeederService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
