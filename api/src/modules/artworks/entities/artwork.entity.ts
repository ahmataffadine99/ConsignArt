import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Artist } from '../../artists/entities/artist.entity';
import { ArtworkStatus } from '../enums/artwork-status.enum';

@Entity('artworks')
export class Artwork {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'Untitled' })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  year: number;

  @Column({ nullable: true })
  technique: string;

  @Column({ type: 'jsonb', nullable: true })
  dimensions: any;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  reservePrice: number;

  @Index()
  @Column({ type: 'enum', enum: ArtworkStatus, default: ArtworkStatus.AVAILABLE })
  status: ArtworkStatus;

  @Column({ nullable: true })
  imageUrl: string;

  @ManyToOne(() => Artist, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'artistId' })
  artist: Artist;

  @Column()
  artistId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
