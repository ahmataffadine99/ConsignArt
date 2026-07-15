import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLoanDto {
  @ApiProperty({ example: 'uuid-artwork-id', description: 'ID of the artwork to loan' })
  @IsNotEmpty()
  @IsUUID()
  artworkId: string;

  @ApiProperty({ example: 'uuid-gallery-id', description: 'ID of the gallery receiving the loan' })
  @IsNotEmpty()
  @IsUUID()
  toGalleryId: string;

  @ApiProperty({ example: '2026-10-01', description: 'Start date of the loan' })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-10-31', description: 'End date of the loan' })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: 'Handle with care, insured for 500000 EUR', description: 'Loan conditions' })
  @IsOptional()
  @IsString()
  conditions?: string;
}
