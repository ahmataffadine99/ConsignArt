import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ArtworksService } from './artworks.service';
import { ArtworkStatusHistoryService } from './artwork-status-history.service';
import { CreateArtworkDto } from './dto/create-artwork.dto';
import { UpdateArtworkDto } from './dto/update-artwork.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { OwnershipGuard } from '../../common/guards/ownership.guard';
import { NormalizePricePipe } from '../../common/pipes/normalize-price.pipe';
import { NotSoldPipe } from '../../common/pipes/not-sold.pipe';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

@ApiTags('Artworks')
@Controller('artworks')
export class ArtworksController {
  constructor(
    private readonly artworksService: ArtworksService,
    private readonly historyService: ArtworkStatusHistoryService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ARTIST, Role.GALLERY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new artwork' })
  create(@Request() req: any, @Body(NormalizePricePipe) createArtworkDto: CreateArtworkDto) {
    return this.artworksService.create(req.user, createArtworkDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all artworks' })
  findAll() {
    return this.artworksService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get artwork details' })
  findOne(@Param('id') id: string) {
    return this.artworksService.findOne(id);
  }

  @Get(':id/history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.GALLERY, Role.ARTIST)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get status change history of an artwork' })
  getHistory(@Param('id') id: string) {
    return this.historyService.findByArtworkId(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, OwnershipGuard)
  @Roles(Role.ARTIST, Role.GALLERY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an artwork' })
  update(
    @Request() req: any,
    @Param('id', NotSoldPipe) id: string,
    @Body(NormalizePricePipe) updateArtworkDto: UpdateArtworkDto,
  ) {
    return this.artworksService.update(id, updateArtworkDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, OwnershipGuard)
  @Roles(Role.ADMIN, Role.ARTIST, Role.GALLERY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an artwork' })
  remove(@Param('id') id: string) {
    return this.artworksService.remove(id);
  }
}
