import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Artwork } from '../../artworks/entities/artwork.entity';

@Entity('exhibitions')
export class Exhibition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  virtualLink: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'galleryId' })
  gallery: User;

  @Column()
  galleryId: string;

  @ManyToMany(() => Artwork, { eager: true })
  @JoinTable({
    name: 'exhibition_artworks',
    joinColumn: { name: 'exhibitionId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'artworkId', referencedColumnName: 'id' },
  })
  artworks: Artwork[];

  @Column({ default: false })
  isClosed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
