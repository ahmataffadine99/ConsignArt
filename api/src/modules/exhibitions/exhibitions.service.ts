import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Exhibition } from './entities/exhibition.entity';
import { Loan } from './entities/loan.entity';
import { Artwork } from '../artworks/entities/artwork.entity';
import { CreateExhibitionDto } from './dto/create-exhibition.dto';
import { CreateLoanDto } from './dto/create-loan.dto';
import { ArtworkStatus } from '../artworks/enums/artwork-status.enum';
import { LoanStatus } from './enums/loan-status.enum';
import { BusinessRuleViolationException } from '../../common/exceptions/business-rule.exception';
import { ArtworkStatusHistoryService } from '../artworks/artwork-status-history.service';

@Injectable()
export class ExhibitionsService {
  constructor(
    @InjectRepository(Exhibition)
    private readonly exhibitionRepository: Repository<Exhibition>,
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    @InjectRepository(Artwork)
    private readonly artworkRepository: Repository<Artwork>,
    private readonly historyService: ArtworkStatusHistoryService,
    private readonly dataSource: DataSource,
  ) {}

  async create(galleryId: string, dto: CreateExhibitionDto): Promise<Exhibition> {
    const artworks = await this.artworkRepository.findBy({ id: In(dto.artworkIds) });

    if (artworks.length !== dto.artworkIds.length) {
      throw new NotFoundException('One or more artworks were not found');
    }

    for (const artwork of artworks) {
      if (artwork.status !== ArtworkStatus.AVAILABLE) {
        throw new BusinessRuleViolationException(
          `Artwork "${artwork.id}" is not available. Current status: ${artwork.status}`,
        );
      }
    }

    return this.dataSource.transaction(async (manager) => {
      for (const artwork of artworks) {
        const oldStatus = artwork.status;
        artwork.status = ArtworkStatus.ON_LOAN;
        await manager.save(Artwork, artwork);
        await this.historyService.record(manager, artwork.id, oldStatus, ArtworkStatus.ON_LOAN, galleryId);
      }

      const exhibition = manager.create(Exhibition, {
        name: dto.name,
        startDate: dto.startDate,
        endDate: dto.endDate,
        location: dto.location,
        virtualLink: dto.virtualLink,
        galleryId,
        artworks,
      });

      return manager.save(Exhibition, exhibition);
    });
  }

  findAll(): Promise<Exhibition[]> {
    return this.exhibitionRepository.find({
      relations: { gallery: true, artworks: true },
    });
  }

  async findOne(id: string): Promise<Exhibition> {
    const exhibition = await this.exhibitionRepository.findOne({
      where: { id },
      relations: { gallery: true, artworks: true },
    });

    if (!exhibition) {
      throw new NotFoundException(`Exhibition with id ${id} not found`);
    }

    return exhibition;
  }

  async close(id: string): Promise<Exhibition> {
    const exhibition = await this.findOne(id);

    if (exhibition.isClosed) {
      throw new BusinessRuleViolationException('Exhibition is already closed');
    }

    return this.dataSource.transaction(async (manager) => {
      for (const artwork of exhibition.artworks) {
        if (artwork.status === ArtworkStatus.ON_LOAN) {
          const oldStatus = artwork.status;
          artwork.status = ArtworkStatus.AVAILABLE;
          await manager.save(Artwork, artwork);
          await this.historyService.record(manager, artwork.id, oldStatus, ArtworkStatus.AVAILABLE);
        }
      }

      exhibition.isClosed = true;
      return manager.save(Exhibition, exhibition);
    });
  }

  async createLoan(fromGalleryId: string, dto: CreateLoanDto): Promise<Loan> {
    const artwork = await this.artworkRepository.findOne({ where: { id: dto.artworkId } });

    if (!artwork) {
      throw new NotFoundException(`Artwork with id ${dto.artworkId} not found`);
    }

    if (artwork.status !== ArtworkStatus.AVAILABLE) {
      throw new BusinessRuleViolationException(
        `Artwork is not available for loan. Current status: ${artwork.status}`,
      );
    }

    const existingLoan = await this.loanRepository.findOne({
      where: { artworkId: dto.artworkId, status: LoanStatus.ACTIVE },
    });

    if (existingLoan) {
      throw new BusinessRuleViolationException('This artwork already has an active loan');
    }

    return this.dataSource.transaction(async (manager) => {
      const oldStatus = artwork.status;
      artwork.status = ArtworkStatus.ON_LOAN;
      await manager.save(Artwork, artwork);
      await this.historyService.record(manager, artwork.id, oldStatus, ArtworkStatus.ON_LOAN, fromGalleryId);

      const loan = manager.create(Loan, {
        artworkId: dto.artworkId,
        fromGalleryId,
        toGalleryId: dto.toGalleryId,
        startDate: dto.startDate,
        endDate: dto.endDate,
        conditions: dto.conditions,
        status: LoanStatus.ACTIVE,
      });

      return manager.save(Loan, loan);
    });
  }

  async returnLoan(id: string): Promise<Loan> {
    const loan = await this.loanRepository.findOne({
      where: { id },
      relations: { artwork: true },
    });

    if (!loan) {
      throw new NotFoundException(`Loan with id ${id} not found`);
    }

    if (loan.status === LoanStatus.RETURNED) {
      throw new BusinessRuleViolationException('This loan has already been returned');
    }

    return this.dataSource.transaction(async (manager) => {
      const oldStatus = loan.artwork.status;
      loan.artwork.status = ArtworkStatus.AVAILABLE;
      await manager.save(Artwork, loan.artwork);
      await this.historyService.record(manager, loan.artwork.id, oldStatus, ArtworkStatus.AVAILABLE);

      loan.status = LoanStatus.RETURNED;
      return manager.save(Loan, loan);
    });
  }

  findAllLoans(): Promise<Loan[]> {
    return this.loanRepository.find({
      relations: { artwork: true, fromGallery: true, toGallery: true },
    });
  }
}

  async create(galleryId: string, dto: CreateExhibitionDto): Promise<Exhibition> {
    const artworks = await this.artworkRepository.findBy({ id: In(dto.artworkIds) });

    if (artworks.length !== dto.artworkIds.length) {
      throw new NotFoundException('One or more artworks were not found');
    }

    for (const artwork of artworks) {
      if (artwork.status !== ArtworkStatus.AVAILABLE) {
        throw new BusinessRuleViolationException(
          `Artwork "${artwork.id}" is not available. Current status: ${artwork.status}`,
        );
      }
    }

    return this.dataSource.transaction(async (manager) => {
      for (const artwork of artworks) {
        artwork.status = ArtworkStatus.ON_LOAN;
        await manager.save(Artwork, artwork);
      }

      const exhibition = manager.create(Exhibition, {
        name: dto.name,
        startDate: dto.startDate,
        endDate: dto.endDate,
        location: dto.location,
        virtualLink: dto.virtualLink,
        galleryId,
        artworks,
      });

      return manager.save(Exhibition, exhibition);
    });
  }

  findAll(): Promise<Exhibition[]> {
    return this.exhibitionRepository.find({
      relations: { gallery: true, artworks: true },
    });
  }

  async findOne(id: string): Promise<Exhibition> {
    const exhibition = await this.exhibitionRepository.findOne({
      where: { id },
      relations: { gallery: true, artworks: true },
    });

    if (!exhibition) {
      throw new NotFoundException(`Exhibition with id ${id} not found`);
    }

    return exhibition;
  }

  async close(id: string): Promise<Exhibition> {
    const exhibition = await this.findOne(id);

    if (exhibition.isClosed) {
      throw new BusinessRuleViolationException('Exhibition is already closed');
    }

    return this.dataSource.transaction(async (manager) => {
      for (const artwork of exhibition.artworks) {
        if (artwork.status === ArtworkStatus.ON_LOAN) {
          artwork.status = ArtworkStatus.AVAILABLE;
          await manager.save(Artwork, artwork);
        }
      }

      exhibition.isClosed = true;
      return manager.save(Exhibition, exhibition);
    });
  }

  async createLoan(fromGalleryId: string, dto: CreateLoanDto): Promise<Loan> {
    const artwork = await this.artworkRepository.findOne({ where: { id: dto.artworkId } });

    if (!artwork) {
      throw new NotFoundException(`Artwork with id ${dto.artworkId} not found`);
    }

    if (artwork.status !== ArtworkStatus.AVAILABLE) {
      throw new BusinessRuleViolationException(
        `Artwork is not available for loan. Current status: ${artwork.status}`,
      );
    }

    const existingLoan = await this.loanRepository.findOne({
      where: { artworkId: dto.artworkId, status: LoanStatus.ACTIVE },
    });

    if (existingLoan) {
      throw new BusinessRuleViolationException('This artwork already has an active loan');
    }

    return this.dataSource.transaction(async (manager) => {
      artwork.status = ArtworkStatus.ON_LOAN;
      await manager.save(Artwork, artwork);

      const loan = manager.create(Loan, {
        artworkId: dto.artworkId,
        fromGalleryId,
        toGalleryId: dto.toGalleryId,
        startDate: dto.startDate,
        endDate: dto.endDate,
        conditions: dto.conditions,
        status: LoanStatus.ACTIVE,
      });

      return manager.save(Loan, loan);
    });
  }

  async returnLoan(id: string): Promise<Loan> {
    const loan = await this.loanRepository.findOne({
      where: { id },
      relations: { artwork: true },
    });

    if (!loan) {
      throw new NotFoundException(`Loan with id ${id} not found`);
    }

    if (loan.status === LoanStatus.RETURNED) {
      throw new BusinessRuleViolationException('This loan has already been returned');
    }

    return this.dataSource.transaction(async (manager) => {
      loan.artwork.status = ArtworkStatus.AVAILABLE;
      await manager.save(Artwork, loan.artwork);

      loan.status = LoanStatus.RETURNED;
      return manager.save(Loan, loan);
    });
  }

  findAllLoans(): Promise<Loan[]> {
    return this.loanRepository.find({
      relations: { artwork: true, fromGallery: true, toGallery: true },
    });
  }
}
