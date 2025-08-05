import { Controller, Get, Query, Param, Post, Body } from '@nestjs/common';
import { ZipcodeService } from '../services/zipcode.service';
import {
  ZipcodeQueryDto,
  ZipcodeBulkDto,
  ZipcodeGeoQueryDto,
} from '../dto/zipcode-query.dto';

@Controller('api/v1/zipcodes')
export class ZipcodeController {
  constructor(private readonly zipcodeService: ZipcodeService) {}

  @Get('stats')
  async getStats() {
    return this.zipcodeService.getStats();
  }

  @Get('bounds')
  async getBounds() {
    return this.zipcodeService.getBounds();
  }

  @Get('search/:prefix')
  async searchByPrefix(
    @Param('prefix') prefix: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.zipcodeService.searchByPrefix(prefix, limitNum);
  }

  @Get('near')
  async findNear(@Query() query: ZipcodeGeoQueryDto) {
    return this.zipcodeService.findNear(query);
  }

  @Get('containing')
  async findContaining(
    @Query('longitude') longitude: string,
    @Query('latitude') latitude: string,
  ) {
    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);
    
    if (isNaN(lng) || isNaN(lat)) {
      throw new Error('Invalid longitude or latitude values');
    }
    
    return this.zipcodeService.findContaining(lng, lat);
  }

  @Post('bulk')
  async findBulk(@Body() body: ZipcodeBulkDto) {
    return this.zipcodeService.findByIds(body.zipcodes);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.zipcodeService.findById(id);
  }

  @Get()
  async findAll(@Query() query: ZipcodeQueryDto) {
    return this.zipcodeService.findAll(query);
  }
}