import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ArtworksService } from './artworks.service';
import { CreateArtworkDto } from './dto/create-artwork.dto';
import { UpdateArtworkDto } from './dto/update-artwork.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
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
  @ApiOperation({ summary: 'Ajouter une œuvre (Réservé aux artistes/galeries)' })
  create(@Request() req: any, @Body() createArtworkDto: CreateArtworkDto) {
    return this.artworksService.create(req.user.userId, createArtworkDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister toutes les œuvres (Public)' })
  findAll() {
    return this.artworksService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une œuvre (Public)' })
  findOne(@Param('id') id: string) {
    return this.artworksService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ARTIST, Role.GALLERY)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Modifier une œuvre (Réservé aux artistes/galeries)" })
  update(@Param('id') id: string, @Body() updateArtworkDto: UpdateArtworkDto) {
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
