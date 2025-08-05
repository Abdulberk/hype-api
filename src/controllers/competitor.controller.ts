import { Controller, Get, Query, Param } from '@nestjs/common';
import { CompetitorService } from '../services/competitor.service';
import {
  CompetitorQueryDto,
  CompetitorRadiusDto,
} from '../dto/competitor-query.dto';

@Controller('api/v1/competitors')
export class CompetitorController {
  constructor(private readonly competitorService: CompetitorService) {}

  @Get('stats')
  async getStats() {
    return this.competitorService.getStats();
  }

  @Get('industries')
  async getIndustries() {
    return this.competitorService.getIndustries();
  }

  @Get('distance-distribution')
  async getDistanceDistribution() {
    return this.competitorService.getDistanceDistribution();
  }

  @Get('near')
  async findNear(@Query() query: CompetitorRadiusDto) {
    return this.competitorService.findNear(query);
  }

  @Get('place/:placeId')
  async getCompetitorsByPlace(
    @Param('placeId') placeId: string,
    @Query() query: CompetitorQueryDto,
  ) {
    return this.competitorService.findByPlaceId(placeId, query);
  }

  @Get()
  async findAll(@Query() query: CompetitorQueryDto) {
    return this.competitorService.findAll(query);
  }
}
