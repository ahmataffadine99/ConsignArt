import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../enums/role.enum';
import { User } from '../entities/user.entity';

export class UserDto {
    @ApiProperty({ description: 'Identifiant unique de l\'utilisateur' })
    id: string;

    @ApiProperty({ description: 'Adresse email' })
    email: string;

    @ApiProperty({ enum: Role, description: 'Rôle de l\'utilisateur' })
    role: Role;

    @ApiProperty({ description: 'Indique si le compte est actif' })
    isActive: boolean;

    @ApiProperty({ description: 'Date de création du compte' })
    createdAt: Date;

    @ApiProperty({ description: 'Date de dernière modification' })
    updatedAt: Date;

    constructor(partial: Partial<User>) {
        this.id = partial.id!;
        this.email = partial.email!;
        this.role = partial.role!;
        this.isActive = partial.isActive!;
        this.createdAt = partial.createdAt!;
        this.updatedAt = partial.updatedAt!;
    }
}
