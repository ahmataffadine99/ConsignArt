import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ArtworksService } from './artworks.service';
import { CreateArtworkDto } from './dto/create-artwork.dto';
import { UpdateArtworkDto } from './dto/update-artwork.dto';

@Controller('artworks')
export class ArtworksController {
  constructor(private readonly artworksService: ArtworksService) {}

  @Post()
  create(@Body() createArtworkDto: CreateArtworkDto) {
    return this.artworksService.create(createArtworkDto);
  }

  @Get()
  findAll() {
    return this.artworksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.artworksService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateArtworkDto: UpdateArtworkDto) {
    return this.artworksService.update(+id, updateArtworkDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.artworksService.remove(+id);
  }
}
