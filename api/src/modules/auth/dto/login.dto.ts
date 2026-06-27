import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@consignart.com', description: "L'adresse email de l'utilisateur" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Le mot de passe de connexion' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
