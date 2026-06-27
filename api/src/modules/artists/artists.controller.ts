import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ArtistsService } from './artists.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

@ApiTags('Artistes (Artists)')
@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ARTIST, Role.GALLERY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un profil artiste (Réservé aux artistes et galeries)' })
  create(@Request() req: any, @Body() createArtistDto: CreateArtistDto) {
    // req.user est injecté par JwtStrategy
    return this.artistsService.create(req.user.userId, createArtistDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les artistes (Public)' })
  findAll() {
    return this.artistsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un artiste par son ID (Public)' })
  findOne(@Param('id') id: string) {
    return this.artistsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ARTIST, Role.GALLERY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour un profil artiste' })
  update(@Param('id') id: string, @Body() updateArtistDto: UpdateArtistDto) {
    return this.artistsService.update(id, updateArtistDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un artiste (Réservé aux Admins)' })
  remove(@Param('id') id: string) {
    return this.artistsService.remove(id);
  }
}
