import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateArtistDto {
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
