import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Artwork } from './artwork.entity';
import { ArtworkStatus } from '../enums/artwork-status.enum';

@Entity('artwork_status_history')
export class ArtworkStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @ManyToOne(() => Artwork, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'artworkId' })
  artwork: Artwork;

  @Column()
  artworkId: string;

  @Column({ type: 'enum', enum: ArtworkStatus, nullable: true })
  oldStatus: ArtworkStatus | null;

  @Column({ type: 'enum', enum: ArtworkStatus })
  newStatus: ArtworkStatus;

  @Column({ nullable: true })
  changedById: string;

  @CreateDateColumn()
  changedAt: Date;
}
