import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { Invoice } from './entities/invoice.entity';
import { Artwork } from '../artworks/entities/artwork.entity';
import { User } from '../users/entities/user.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { ArtworkStatus } from '../artworks/enums/artwork-status.enum';
import { InvoiceType } from './enums/invoice-type.enum';
import { Role } from '../users/enums/role.enum';
import { BusinessRuleViolationException } from '../../common/exceptions/business-rule.exception';
import { ArtworkStatusHistoryService } from '../artworks/artwork-status-history.service';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(Artwork)
    private readonly artworkRepository: Repository<Artwork>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly historyService: ArtworkStatusHistoryService,
    private readonly dataSource: DataSource,
  ) {}

  private calculateCommissionRate(salePrice: number): number {
    if (salePrice <= 5000) return 40;
    if (salePrice <= 20000) return 35;
    return 30;
  }

  async create(createSaleDto: CreateSaleDto): Promise<Sale> {
    const { artworkId, buyerId, salePrice } = createSaleDto;

    const artwork = await this.artworkRepository.findOne({ where: { id: artworkId } });
    if (!artwork) {
      throw new NotFoundException(`Artwork with id ${artworkId} not found`);
    }

    if (artwork.status !== ArtworkStatus.AVAILABLE) {
      throw new BusinessRuleViolationException(
        `Artwork is not available for sale. Current status: ${artwork.status}`,
      );
    }

    if (artwork.reservePrice && salePrice < Number(artwork.reservePrice)) {
      throw new BusinessRuleViolationException(
        `Sale price ${salePrice} is below the reserve price ${artwork.reservePrice}`,
      );
    }

    const buyer = await this.userRepository.findOne({ where: { id: buyerId } });
    if (!buyer) {
      throw new NotFoundException(`Buyer with id ${buyerId} not found`);
    }

    if (buyer.role !== Role.COLLECTOR) {
      throw new BusinessRuleViolationException('The buyer must have the collector role');
    }

    const commissionRate = this.calculateCommissionRate(salePrice);
    const commissionAmount = (salePrice * commissionRate) / 100;
    const artistBalance = salePrice - commissionAmount;

    return this.dataSource.transaction(async (manager) => {
      const oldStatus = artwork.status;
      artwork.status = ArtworkStatus.SOLD;
      await manager.save(Artwork, artwork);
      await this.historyService.record(manager, artworkId, oldStatus, ArtworkStatus.SOLD, buyerId);

      const sale = manager.create(Sale, {
        artworkId,
        buyerId,
        salePrice,
        commissionRate,
        commissionAmount,
        artistBalance,
      });
      const savedSale = await manager.save(Sale, sale);

      const buyerInvoice = manager.create(Invoice, {
        saleId: savedSale.id,
        type: InvoiceType.BUYER,
        amount: salePrice,
      });

      const artistStatement = manager.create(Invoice, {
        saleId: savedSale.id,
        type: InvoiceType.ARTIST,
        amount: artistBalance,
      });

      await manager.save(Invoice, [buyerInvoice, artistStatement]);

      return manager.findOne(Sale, {
        where: { id: savedSale.id },
        relations: { artwork: true, buyer: true, invoices: true },
      }) as Promise<Sale>;
    });
  }

  findAll(user: any): Promise<Sale[]> {
    const relations = { artwork: true, buyer: true, invoices: true };

    if (user.role === Role.ARTIST) {
      return this.saleRepository
        .createQueryBuilder('sale')
        .leftJoinAndSelect('sale.artwork', 'artwork')
        .leftJoinAndSelect('artwork.artist', 'artist')
        .leftJoinAndSelect('sale.buyer', 'buyer')
        .leftJoinAndSelect('sale.invoices', 'invoices')
        .where('artist.userId = :userId', { userId: user.userId })
        .getMany();
    }

    if (user.role === Role.COLLECTOR) {
      return this.saleRepository.find({
        where: { buyerId: user.userId },
        relations,
      });
    }

    return this.saleRepository.find({ relations });
  }

  async findOne(id: string, user: any): Promise<Sale> {
    const sale = await this.saleRepository.findOne({
      where: { id },
      relations: { artwork: true, buyer: true, invoices: true },
    });

    if (!sale) {
      throw new NotFoundException(`Sale with id ${id} not found`);
    }

    if (user.role === Role.COLLECTOR && sale.buyerId !== user.userId) {
      throw new BusinessRuleViolationException('You do not have access to this sale');
    }

    return sale;
  }
}

  private calculateCommissionRate(salePrice: number): number {
    if (salePrice <= 5000) return 40;
    if (salePrice <= 20000) return 35;
    return 30;
  }

  async create(createSaleDto: CreateSaleDto): Promise<Sale> {
    const { artworkId, buyerId, salePrice } = createSaleDto;

    const artwork = await this.artworkRepository.findOne({ where: { id: artworkId } });
    if (!artwork) {
      throw new NotFoundException(`Artwork with id ${artworkId} not found`);
    }

    if (artwork.status !== ArtworkStatus.AVAILABLE) {
      throw new BusinessRuleViolationException(
        `Artwork is not available for sale. Current status: ${artwork.status}`,
      );
    }

    if (artwork.reservePrice && salePrice < Number(artwork.reservePrice)) {
      throw new BusinessRuleViolationException(
        `Sale price ${salePrice} is below the reserve price ${artwork.reservePrice}`,
      );
    }

    const buyer = await this.userRepository.findOne({ where: { id: buyerId } });
    if (!buyer) {
      throw new NotFoundException(`Buyer with id ${buyerId} not found`);
    }

    if (buyer.role !== Role.COLLECTOR) {
      throw new BusinessRuleViolationException('The buyer must have the collector role');
    }

    const commissionRate = this.calculateCommissionRate(salePrice);
    const commissionAmount = (salePrice * commissionRate) / 100;
    const artistBalance = salePrice - commissionAmount;

    return this.dataSource.transaction(async (manager) => {
      artwork.status = ArtworkStatus.SOLD;
      await manager.save(Artwork, artwork);

      const sale = manager.create(Sale, {
        artworkId,
        buyerId,
        salePrice,
        commissionRate,
        commissionAmount,
        artistBalance,
      });
      const savedSale = await manager.save(Sale, sale);

      const buyerInvoice = manager.create(Invoice, {
        saleId: savedSale.id,
        type: InvoiceType.BUYER,
        amount: salePrice,
      });

      const artistStatement = manager.create(Invoice, {
        saleId: savedSale.id,
        type: InvoiceType.ARTIST,
        amount: artistBalance,
      });

      await manager.save(Invoice, [buyerInvoice, artistStatement]);

      return manager.findOne(Sale, {
        where: { id: savedSale.id },
        relations: { artwork: true, buyer: true, invoices: true },
      }) as Promise<Sale>;
    });
  }

  findAll(user: any): Promise<Sale[]> {
    const relations = { artwork: true, buyer: true, invoices: true };

    if (user.role === Role.ARTIST) {
      return this.saleRepository
        .createQueryBuilder('sale')
        .leftJoinAndSelect('sale.artwork', 'artwork')
        .leftJoinAndSelect('artwork.artist', 'artist')
        .leftJoinAndSelect('sale.buyer', 'buyer')
        .leftJoinAndSelect('sale.invoices', 'invoices')
        .where('artist.userId = :userId', { userId: user.userId })
        .getMany();
    }

    if (user.role === Role.COLLECTOR) {
      return this.saleRepository.find({
        where: { buyerId: user.userId },
        relations,
      });
    }

    return this.saleRepository.find({ relations });
  }

  async findOne(id: string, user: any): Promise<Sale> {
    const sale = await this.saleRepository.findOne({
      where: { id },
      relations: { artwork: true, buyer: true, invoices: true },
    });

    if (!sale) {
      throw new NotFoundException(`Sale with id ${id} not found`);
    }

    if (user.role === Role.COLLECTOR && sale.buyerId !== user.userId) {
      throw new BusinessRuleViolationException('You do not have access to this sale');
    }

    return sale;
  }
}
