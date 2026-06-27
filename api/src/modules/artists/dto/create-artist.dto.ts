import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateArtistDto {
  @ApiProperty({ example: 'Jean', description: 'Prénom de l’artiste' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Dupont', description: 'Nom de l’artiste' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: true, description: 'Statut de l’artiste' })
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'ID de la galerie gérant l\'artiste' })
  @IsOptional()
  @IsString()
  galleryId?: string;
  @ApiPropertyOptional({ description: 'Biographie détaillée de l’artiste' })
  @IsOptional()
  @IsString()
  biography?: string;

  @ApiProperty({ example: 'Française', description: 'Nationalité de l’artiste' })
  @IsNotEmpty()
  @IsString()
  nationality: string;

  @ApiPropertyOptional({ example: 'https://monportfolio.com', description: 'Lien vers un portfolio externe' })
  @IsOptional()
  @IsUrl()
  portfolioUrl?: string;
}
