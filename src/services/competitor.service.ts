import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Competitor } from '../schemas/competitor.schema';
import {
  CompetitorQueryDto,
  CompetitorRadiusDto,
} from '../dto/competitor-query.dto';

@Injectable()
export class CompetitorService {
  constructor(
    @InjectModel(Competitor.name)
    private competitorModel: Model<Competitor>,
  ) {}

  async findAll(query?: CompetitorQueryDto) {
    const filter: any = {};

    // Industry filtering
    if (query?.industries && query.industries.length > 0) {
      filter.sub_category = { $in: query.industries };
    }

    // Max distance filtering
    if (query?.maxDistance !== undefined) {
      filter.distance = { $lte: query.maxDistance };
    }

    // Search filtering
    if (query?.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { street_address: { $regex: query.search, $options: 'i' } },
        { city: { $regex: query.search, $options: 'i' } },
      ];
    }

    const limit = query?.limit;
    const page = query?.page || 1;

    if (limit) {
      // Pagination kullanılıyor
      const skip = (page - 1) * limit;

      const [competitors, total] = await Promise.all([
        this.competitorModel
          .find(filter)
          .sort({ distance: 1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.competitorModel.countDocuments(filter),
      ]);

      return {
        data: competitors,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } else {
      // Limit yok, tüm kayıtları getir
      const [competitors, total] = await Promise.all([
        this.competitorModel.find(filter).sort({ distance: 1 }).exec(),
        this.competitorModel.countDocuments(filter),
      ]);

      return {
        data: competitors,
        total,
        pagination: null,
      };
    }
  }

  async findNear(query: CompetitorRadiusDto) {
    // My Place coordinates (Starbucks)
    const MY_PLACE_LONGITUDE = -104.73874;
    const MY_PLACE_LATITUDE = 38.932625;

    const radiusInMeters = (query.radius || 5) * 1000; // Convert km to meters

    const filter: any = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [MY_PLACE_LONGITUDE, MY_PLACE_LATITUDE],
          },
          $maxDistance: radiusInMeters,
        },
      },
    };

    // Industry filtering
    if (query.industries && query.industries.length > 0) {
      filter.sub_category = { $in: query.industries };
    }

    const queryBuilder = this.competitorModel.find(filter);

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    return queryBuilder.exec();
  }

  async findByPlaceId(placeId: string, query?: CompetitorQueryDto) {
    const filter: any = { place_id: placeId };

    // Industry filtering
    if (query?.industries && query.industries.length > 0) {
      filter.sub_category = { $in: query.industries };
    }

    // Max distance filtering
    if (query?.maxDistance !== undefined) {
      filter.distance = { $lte: query.maxDistance };
    }

    const queryBuilder = this.competitorModel
      .find(filter)
      .sort({ distance: 1 });

    if (query?.limit) {
      queryBuilder.limit(query.limit);
    }

    return queryBuilder.exec();
  }

  async getIndustries() {
    const industries = await this.competitorModel.distinct('sub_category');
    return industries.filter(Boolean).sort();
  }

  async getStats() {
    const pipeline: any[] = [
      {
        $group: {
          _id: null,
          totalCompetitors: { $sum: 1 },
          uniquePlaces: { $addToSet: '$place_id' },
          uniqueIndustries: { $addToSet: '$sub_category' },
          avgDistance: { $avg: '$distance' },
          maxDistance: { $max: '$distance' },
          minDistance: { $min: '$distance' },
          withTradeAreaActivity: {
            $sum: { $cond: ['$trade_area_activity', 1, 0] },
          },
          withHomeLocationsActivity: {
            $sum: { $cond: ['$home_locations_activity', 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalCompetitors: 1,
          uniquePlacesCount: { $size: '$uniquePlaces' },
          uniqueIndustriesCount: { $size: '$uniqueIndustries' },
          distanceStats: {
            avg: { $round: ['$avgDistance', 2] },
            max: { $round: ['$maxDistance', 2] },
            min: { $round: ['$minDistance', 2] },
          },
          activityStats: {
            tradeAreaActivity: '$withTradeAreaActivity',
            homeLocationsActivity: '$withHomeLocationsActivity',
          },
        },
      },
    ];

    const stats = await this.competitorModel.aggregate(pipeline).exec();
    return (
      stats[0] || {
        totalCompetitors: 0,
        uniquePlacesCount: 0,
        uniqueIndustriesCount: 0,
        distanceStats: { avg: 0, max: 0, min: 0 },
        activityStats: { tradeAreaActivity: 0, homeLocationsActivity: 0 },
      }
    );
  }

  async getDistanceDistribution() {
    const pipeline: any[] = [
      {
        $bucket: {
          groupBy: '$distance',
          boundaries: [0, 1, 2, 5, 10, 20, 50, 100],
          default: '100+',
          output: {
            count: { $sum: 1 },
            avgDistance: { $avg: '$distance' },
          },
        },
      },
    ];

    return this.competitorModel.aggregate(pipeline).exec();
  }
}
