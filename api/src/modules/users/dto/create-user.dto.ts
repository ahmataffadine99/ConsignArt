import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../enums/role.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'admin@consignart.com', description: "L'adresse email de l'utilisateur" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Le mot de passe (min 6 caractères)' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: Role, example: Role.GALLERY, description: "Le rôle de l'utilisateur" })
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
}
