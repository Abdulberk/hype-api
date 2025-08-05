import { Controller, Get, Param, Query } from '@nestjs/common';
import { HomeZipcodesService } from '../services/home-zipcodes.service';
import {
  HomeZipcodesQueryDto,
  PercentileAnalysisDto,
} from '../dto/home-zipcodes-query.dto';

@Controller('api/v1/home-zipcodes')
export class HomeZipcodesController {
  constructor(private readonly homeZipcodesService: HomeZipcodesService) {}

  @Get('stats')
  async getStats() {
    return this.homeZipcodesService.getStats();
  }

  @Get(':placeId')
  async getHomeZipcodesByPlace(
    @Param('placeId') placeId: string,
    @Query() query: HomeZipcodesQueryDto,
  ) {
    return this.homeZipcodesService.findByPlaceId(placeId, query);
  }

  @Get(':placeId/zipcodes')
  async getZipcodesByPlace(@Param('placeId') placeId: string) {
    return this.homeZipcodesService.getZipcodesByPlace(placeId);
  }

  @Get(':placeId/top/:topN')
  async getTopZipcodes(
    @Param('placeId') placeId: string,
    @Param('topN') topN: string,
  ) {
    const limit = parseInt(topN, 10);
    if (isNaN(limit) || limit < 1 || limit > 100) {
      throw new Error('topN must be a number between 1 and 100');
    }
    return this.homeZipcodesService.getTopZipcodes(placeId, limit);
  }

  @Get(':placeId/analysis')
  async getPercentileAnalysis(
    @Param('placeId') placeId: string,
    @Query() query: PercentileAnalysisDto,
  ) {
    return this.homeZipcodesService.getPercentileAnalysis(placeId, query);
  }
}
