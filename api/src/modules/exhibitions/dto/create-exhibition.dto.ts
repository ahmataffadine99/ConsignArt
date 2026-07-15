import { IsArray, IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExhibitionDto {
  @ApiProperty({ example: 'Art Basel 2026', description: 'Name of the exhibition' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: '2026-09-01', description: 'Start date of the exhibition' })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-09-30', description: 'End date of the exhibition' })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: 'Paris, Grand Palais', description: 'Physical location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 'https://virtual.exhibition.com', description: 'Virtual exhibition link' })
  @IsOptional()
  @IsString()
  virtualLink?: string;

  @ApiProperty({ example: ['uuid-artwork-1', 'uuid-artwork-2'], description: 'List of artwork IDs to include' })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('all', { each: true })
  artworkIds: string[];
}
