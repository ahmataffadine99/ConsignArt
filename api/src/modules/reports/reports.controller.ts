import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('gallery/:id')
  @Roles(Role.ADMIN, Role.GALLERY)
  @ApiOperation({ summary: 'Get sales report for a gallery' })
  getGalleryReport(@Param('id') id: string) {
    return this.reportsService.getGalleryReport(id);
  }

  @Get('artist/me')
  @Roles(Role.ARTIST)
  @ApiOperation({ summary: 'Get personal sales report for the authenticated artist' })
  getMyArtistReport(@Request() req: any) {
    return this.reportsService.getArtistReport(req.user.userId);
  }

  @Get('artist/:userId')
  @Roles(Role.ADMIN, Role.GALLERY)
  @ApiOperation({ summary: 'Get sales report for a specific artist by user id' })
  getArtistReport(@Param('userId') userId: string) {
    return this.reportsService.getArtistReport(userId);
  }

  @Get('admin')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get platform-wide admin report' })
  getAdminReport() {
    return this.reportsService.getAdminReport();
  }
}
