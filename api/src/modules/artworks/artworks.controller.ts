import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ArtworksService } from './artworks.service';
import { CreateArtworkDto } from './dto/create-artwork.dto';
import { UpdateArtworkDto } from './dto/update-artwork.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { OwnershipGuard } from '../../common/guards/ownership.guard';
import { NormalizePricePipe } from '../../common/pipes/normalize-price.pipe';
import { NotSoldPipe } from '../../common/pipes/not-sold.pipe';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

@ApiTags('Œuvres d\'art (Artworks)')
@Controller('artworks')
export class ArtworksController {
  constructor(private readonly artworksService: ArtworksService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ARTIST, Role.GALLERY)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Créer une nouvelle œuvre (Réservé aux artistes/galeries)" })
  create(@Request() req: any, @Body(NormalizePricePipe) createArtworkDto: CreateArtworkDto) {
    const userId = req.user.userId;
    return this.artworksService.create(userId, createArtworkDto);
  }

  @Get()
  @ApiOperation({ summary: "Lister toutes les œuvres d'art (Public)" })
  findAll() {
    return this.artworksService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: "Obtenir les détails d'une œuvre (Public)" })
  findOne(@Param('id') id: string) {
    return this.artworksService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, OwnershipGuard)
  @Roles(Role.ARTIST, Role.GALLERY)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Modifier une œuvre (Réservé au créateur)" })
  update(
    @Param('id', NotSoldPipe) id: string, 
    @Body(NormalizePricePipe) updateArtworkDto: UpdateArtworkDto
  ) {
    return this.artworksService.update(id, updateArtworkDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Supprimer une œuvre (Réservé aux Admins)" })
  remove(@Param('id') id: string) {
    return this.artworksService.remove(id);
  }
}
