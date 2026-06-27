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

  @ApiProperty({ example: 1500.50, description: "Le prix de l'œuvre" })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ enum: ArtworkStatus, example: ArtworkStatus.AVAILABLE, description: "Le statut de l'œuvre" })
  @IsOptional()
  @IsEnum(ArtworkStatus)
  status?: ArtworkStatus;

  @ApiPropertyOptional({ example: 'https://image.url', description: "URL de l'image de l'œuvre" })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
