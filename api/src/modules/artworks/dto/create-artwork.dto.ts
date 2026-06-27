import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArtworkStatus } from '../enums/artwork-status.enum';

export class CreateArtworkDto {
  @ApiProperty({ example: 'La Joconde', description: "Le titre de l'œuvre" })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Un portrait célèbre...', description: "La description de l'œuvre" })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 1999, description: 'Année de création' })
  @IsOptional()
  @IsNumber()
  year?: number;

  @ApiPropertyOptional({ example: 'Huile sur toile', description: 'Technique utilisée' })
  @IsOptional()
  @IsString()
  technique?: string;

  @ApiPropertyOptional({ example: { hauteur: 100, largeur: 80 }, description: 'Dimensions de l\'œuvre' })
  @IsOptional()
  dimensions?: any;

  @ApiProperty({ example: 1500.50, description: "Le prix de l'œuvre" })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 1000.00, description: 'Prix de réserve' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reservePrice?: number;

  @ApiPropertyOptional({ description: 'ID de l\'artiste (requis si la galerie crée l\'œuvre)' })
  @IsOptional()
  @IsString()
  artistId?: string;

  @ApiPropertyOptional({ enum: ArtworkStatus, example: ArtworkStatus.AVAILABLE, description: "Le statut de l'œuvre" })
  @IsOptional()
  @IsEnum(ArtworkStatus)
  status?: ArtworkStatus;

  @ApiPropertyOptional({ example: 'https://image.url', description: "URL de l'image de l'œuvre" })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
