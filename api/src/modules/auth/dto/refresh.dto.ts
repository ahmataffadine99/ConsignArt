import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshDto {
  @ApiProperty({ description: 'Le refresh token précédemment fourni' })
  @IsNotEmpty()
  @IsString()
  refresh_token: string;
}
