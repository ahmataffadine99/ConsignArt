import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExhibitionsService } from './exhibitions.service';
import { CreateExhibitionDto } from './dto/create-exhibition.dto';
import { CreateLoanDto } from './dto/create-loan.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

@ApiTags('Exhibitions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('exhibitions')
export class ExhibitionsController {
  constructor(private readonly exhibitionsService: ExhibitionsService) {}

  @Post()
  @Roles(Role.GALLERY)
  @ApiOperation({ summary: 'Create a new exhibition and set artworks to on_loan' })
  create(@Request() req: any, @Body() dto: CreateExhibitionDto) {
    return this.exhibitionsService.create(req.user.userId, dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.GALLERY, Role.ARTIST, Role.COLLECTOR)
  @ApiOperation({ summary: 'List all exhibitions' })
  findAll() {
    return this.exhibitionsService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.GALLERY, Role.ARTIST, Role.COLLECTOR)
  @ApiOperation({ summary: 'Get details of an exhibition' })
  findOne(@Param('id') id: string) {
    return this.exhibitionsService.findOne(id);
  }

  @Patch(':id/close')
  @Roles(Role.GALLERY, Role.ADMIN)
  @ApiOperation({ summary: 'Close an exhibition and restore artworks to available' })
  close(@Param('id') id: string) {
    return this.exhibitionsService.close(id);
  }

  @Post('loans')
  @Roles(Role.GALLERY)
  @ApiOperation({ summary: 'Loan an artwork to another gallery' })
  createLoan(@Request() req: any, @Body() dto: CreateLoanDto) {
    return this.exhibitionsService.createLoan(req.user.userId, dto);
  }

  @Get('loans/all')
  @Roles(Role.ADMIN, Role.GALLERY)
  @ApiOperation({ summary: 'List all loans' })
  findAllLoans() {
    return this.exhibitionsService.findAllLoans();
  }

  @Patch('loans/:id/return')
  @Roles(Role.GALLERY, Role.ADMIN)
  @ApiOperation({ summary: 'Return a loaned artwork and restore its status to available' })
  returnLoan(@Param('id') id: string) {
    return this.exhibitionsService.returnLoan(id);
  }
}
