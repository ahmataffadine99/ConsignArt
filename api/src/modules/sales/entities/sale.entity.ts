import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Artwork } from '../../artworks/entities/artwork.entity';
import { User } from '../../users/entities/user.entity';
import { Invoice } from './invoice.entity';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Artwork, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'artworkId' })
  artwork: Artwork;

  @Column()
  artworkId: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'buyerId' })
  buyer: User;

  @Column()
  buyerId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  salePrice: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  commissionRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  commissionAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  artistBalance: number;

  @CreateDateColumn()
  saleDate: Date;

  @OneToMany(() => Invoice, (invoice) => invoice.sale, { cascade: true })
  invoices: Invoice[];
}
