import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ArtworkStatusHistory } from '../entities/artwork-status-history.entity';
import { ArtworkStatus } from '../enums/artwork-status.enum';

@Injectable()
export class ArtworkStatusHistoryService {
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
}
