import { IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSaleDto {
  @ApiProperty({ example: 'uuid-artwork-id', description: 'ID of the artwork to sell' })
  @IsNotEmpty()
  @IsUUID()
  @IsString()
  artworkId: string;

  @ApiProperty({ example: 'uuid-buyer-id', description: 'ID of the collector buying the artwork' })
  @IsNotEmpty()
  @IsUUID()
  @IsString()
  buyerId: string;

  @ApiProperty({ example: 3500.00, description: 'Final sale price in euros' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  salePrice: number;
}
