import { Controller, Get, Param, Query, Header, Res } from '@nestjs/common';
import type { Response } from 'express';
import { TradeAreaService } from '../services/trade-area.service';
import { TradeAreaQueryDto } from '../dto/trade-area-query.dto';
import { tradeAreaCache } from '../common/cache/memory-cache';

@Controller('api/v1/trade-areas')
export class TradeAreaController {
  constructor(private readonly tradeAreaService: TradeAreaService) {}

  @Get('cache/stats')
  getCacheStats() {
    return {
      cache: tradeAreaCache.getStats(),
      message: 'In-memory cache statistics for trade areas',
    };
  } 

  @Get('stats')
  async getStats() {
    return this.tradeAreaService.getStats();
  }

  @Get(':placeId')
  @Header('Cache-Control', 'public, max-age=1800') // 30 minutes browser cache
  async findByPlaceId(
    @Param('placeId') placeId: string,
    @Query() query: TradeAreaQueryDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.tradeAreaService.findByPlaceId(placeId, query);
    
    // Set cache headers for large responses
    if (JSON.stringify(result).length > 15000) {
      res.header('Cache-Control', 'public, max-age=1800'); // 30 min
      res.header('ETag', `"${placeId}-${query?.percentage || 'all'}"`);
    }
    
    return result;
  }

  @Get(':placeId/percentages')
  @Header('Cache-Control', 'public, max-age=3600') // 1 hour cache for percentages
  async getAvailablePercentages(@Param('placeId') placeId: string) {
    return this.tradeAreaService.getAvailablePercentages(placeId);
  }

  @Get(':placeId/:percentage')
  @Header('Cache-Control', 'public, max-age=1800') // 30 minutes browser cache
  async findByPlaceIdAndPercentage(
    @Param('placeId') placeId: string,
    @Param('percentage') percentage: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.tradeAreaService.findByPlaceIdAndPercentage(
      placeId,
      percentage,
    );
    
    // Set ETag for specific trade area
    res.header('ETag', `"${placeId}-${percentage}"`);
    
    return result;
  }
}
