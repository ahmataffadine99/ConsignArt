import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ArtworkStatusHistory } from './entities/artwork-status-history.entity';
import { ArtworkStatus } from './enums/artwork-status.enum';

@Injectable()
export class ArtworkStatusHistoryService {
  constructor(
    @InjectRepository(ArtworkStatusHistory)
    private readonly historyRepository: Repository<ArtworkStatusHistory>,
  ) {}

  async record(
    manager: EntityManager,
    artworkId: string,
    oldStatus: ArtworkStatus | null,
    newStatus: ArtworkStatus,
    changedById?: string,
  ): Promise<void> {
    const entry = manager.create(ArtworkStatusHistory, {
      artworkId,
      oldStatus,
      newStatus,
      changedById,
    });
    await manager.save(ArtworkStatusHistory, entry);
  }

  findByArtworkId(artworkId: string): Promise<ArtworkStatusHistory[]> {
    return this.historyRepository.find({
      where: { artworkId },
      order: { changedAt: 'ASC' },
    });
  }
}
