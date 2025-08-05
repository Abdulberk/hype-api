import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TradeArea, TradeAreaDocument } from '../schemas/trade-area.schema';
import { TradeAreaQueryDto } from '../dto/trade-area-query.dto';

@Injectable()
export class TradeAreaService {
  constructor(
    @InjectModel(TradeArea.name)
    private tradeAreaModel: Model<TradeAreaDocument>,
  ) {}

  async findByPlaceId(placeId: string, query?: TradeAreaQueryDto) {
    const filter: any = { place_id: placeId };

    if (query?.percentage) {
      filter.trade_area_percentage = query.percentage;
    }
    

    const tradeAreas = await this.tradeAreaModel
      .find(filter)
      .select('place_id polygon trade_area_percentage')
      .lean()
      .exec();

    if (!tradeAreas || tradeAreas.length === 0) {
      throw new NotFoundException(`No trade areas found for place ${placeId}`);
    }

    return tradeAreas;
  }

  async findByPlaceIdAndPercentage(placeId: string, percentage: number) {
    const tradeArea = await this.tradeAreaModel
      .findOne({
        place_id: placeId,
        trade_area_percentage: percentage,
      })
      .select('place_id polygon trade_area_percentage')
      .lean()
      .exec();

    if (!tradeArea) {
      throw new NotFoundException(
        `Trade area ${percentage}% not found for place ${placeId}`,
      );
    }

    return tradeArea;
  }

  async getAvailablePercentages(placeId: string) {
    const percentages = await this.tradeAreaModel
      .distinct('trade_area_percentage', { place_id: placeId })
      .exec();

    if (!percentages || percentages.length === 0) {
      throw new NotFoundException(`No trade areas found for place ${placeId}`);
    }

    return percentages.sort((a, b) => a - b);
  }

  async getStats() {
    const [totalTradeAreas, uniquePlaces, avgPercentages] = await Promise.all([
      this.tradeAreaModel.countDocuments(),
      this.tradeAreaModel.distinct('place_id'),
      this.tradeAreaModel.aggregate([
        {
          $group: {
            _id: '$trade_area_percentage',
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return {
      totalTradeAreas,
      uniquePlaces: uniquePlaces.length,
      percentageDistribution: avgPercentages,
    };
  }
}
