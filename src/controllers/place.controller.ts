import { Controller, Get, Param, Query } from '@nestjs/common';
import { PlaceService } from '../services/place.service';
import { PlaceQueryDto, PlaceNearbyDto } from '../dto/place-query.dto';

@Controller('api/v1/places')
export class PlaceController {
  constructor(private readonly placeService: PlaceService) {}

  @Get()
  async findAll(@Query() query: PlaceQueryDto) {
    return this.placeService.findAll(query);
  }

  @Get('stats')
  async getStats() {
    return this.placeService.getStats();
  }

  @Get('industries')
  async getIndustries() {
    return this.placeService.getIndustries();
  }

  @Get('cities')
  async getCities() {
    return this.placeService.getCities();
  }

  @Get('nearby')
  async findNearby(@Query() nearbyDto: PlaceNearbyDto) {
    return this.placeService.findNearby(nearbyDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const place = await this.placeService.findOne(id);
    if (!place) {
      throw new Error('Place not found');
    }
    return place;
  }
}
