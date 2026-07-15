import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn, ManyToOne, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('artists')
export class Artist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'text', nullable: true })
  biography: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  nationality: string;

  @Column({ nullable: true })
  portfolioUrl: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Index()
  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'galleryId' })
  gallery: User;

  @Index()
  @Column({ nullable: true })
  galleryId: string;

  @CreateDateColumn()
  createdAt: Date;
}
