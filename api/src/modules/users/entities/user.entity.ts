import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../enums/role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // Hashé avec bcrypt

  @Column({ type: 'varchar', enum: Role, default: Role.COLLECTOR })
  role: Role;

  @Column({ default: true })
  isActive: boolean; // Les galeries (gallery) devront passer à false par défaut dans le service

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
