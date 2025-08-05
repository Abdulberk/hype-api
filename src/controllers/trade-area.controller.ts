import { Controller, Get, Param, Query } from '@nestjs/common';
import { TradeAreaService } from '../services/trade-area.service';
import { TradeAreaQueryDto } from '../dto/trade-area-query.dto';

@Controller('api/v1/trade-areas')
export class TradeAreaController {
  constructor(private readonly tradeAreaService: TradeAreaService) {}

  @Get('stats')
  async getStats() {
    return this.tradeAreaService.getStats();
  }

  @Get(':placeId')
  async findByPlaceId(
    @Param('placeId') placeId: string,
    @Query() query: TradeAreaQueryDto,
  ) {
    return this.tradeAreaService.findByPlaceId(placeId, query);
  }

  @Get(':placeId/percentages')
  async getAvailablePercentages(@Param('placeId') placeId: string) {
    return this.tradeAreaService.getAvailablePercentages(placeId);
  }

  @Get(':placeId/:percentage')
  async findByPlaceIdAndPercentage(
    @Param('placeId') placeId: string,
    @Param('percentage') percentage: number,
  ) {
    return this.tradeAreaService.findByPlaceIdAndPercentage(placeId, percentage);
  }
}