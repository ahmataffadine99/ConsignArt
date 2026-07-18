import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

@ApiTags('Sales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @Roles(Role.GALLERY, Role.COLLECTOR)
  @ApiOperation({ summary: 'Create a new sale for an artwork' })
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(createSaleDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.GALLERY, Role.ARTIST, Role.COLLECTOR)
  @ApiOperation({ summary: 'List sales filtered by role' })
  findAll(@Request() req: any) {
    return this.salesService.findAll(req.user);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.GALLERY, Role.ARTIST, Role.COLLECTOR)
  @ApiOperation({ summary: 'Get details of a specific sale' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.salesService.findOne(id, req.user);
  }
}
