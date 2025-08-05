import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Zipcode } from '../schemas/zipcode.schema';
import {
  ZipcodeQueryDto,
  ZipcodeBulkDto,
  ZipcodeGeoQueryDto,
} from '../dto/zipcode-query.dto';

@Injectable()
export class ZipcodeService {
  constructor(
    @InjectModel(Zipcode.name)
    private zipcodeModel: Model<Zipcode>,
  ) {}

  async findByIds(zipcodeIds: string[]) {
    if (!zipcodeIds || zipcodeIds.length === 0) {
      return [];
    }

    // Limit to prevent abuse
    const limitedIds = zipcodeIds.slice(0, 100);

    return this.zipcodeModel
      .find({ zipcode_id: { $in: limitedIds } })
      .select('zipcode_id polygon')
      .exec();
  }

  async findById(zipcodeId: string) {
    return this.zipcodeModel.findOne({ zipcode_id: zipcodeId }).exec();
  }

  async findAll(query?: ZipcodeQueryDto) {
    const filter: any = {};

    if (query?.zipcodes && query.zipcodes.length > 0) {
      filter.zipcode_id = { $in: query.zipcodes };
    }

    return this.zipcodeModel
      .find(filter)
      .select('zipcode_id polygon')
      .limit(query?.limit || 100)
      .exec();
  }

  async findNear(query: ZipcodeGeoQueryDto) {
    if (!query.longitude || !query.latitude) {
      throw new Error(
        'Longitude and latitude are required for geospatial queries',
      );
    }

    const radiusInMeters = (query.radius || 10) * 1000; // Convert km to meters

    return this.zipcodeModel
      .find({
        polygon: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [query.longitude, query.latitude],
            },
            $maxDistance: radiusInMeters,
          },
        },
      })
      .limit(query.limit || 50)
      .exec();
  }

  async findContaining(longitude: number, latitude: number) {
    return this.zipcodeModel
      .find({
        polygon: {
          $geoIntersects: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
          },
        },
      })
      .exec();
  }

  async getStats() {
    const pipeline: any[] = [
      {
        $group: {
          _id: null,
          totalZipcodes: { $sum: 1 },
          avgCoordinatesCount: {
            $avg: {
              $size: { $arrayElemAt: ['$polygon.coordinates', 0] },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalZipcodes: 1,
          avgCoordinatesCount: { $round: ['$avgCoordinatesCount', 2] },
        },
      },
    ];

    const stats = await this.zipcodeModel.aggregate(pipeline).exec();
    return (
      stats[0] || {
        totalZipcodes: 0,
        avgCoordinatesCount: 0,
      }
    );
  }

  async getBounds() {
    const pipeline: any[] = [
      {
        $project: {
          coordinates: { $arrayElemAt: ['$polygon.coordinates', 0] },
        },
      },
      {
        $unwind: '$coordinates',
      },
      {
        $group: {
          _id: null,
          minLng: { $min: { $arrayElemAt: ['$coordinates', 0] } },
          maxLng: { $max: { $arrayElemAt: ['$coordinates', 0] } },
          minLat: { $min: { $arrayElemAt: ['$coordinates', 1] } },
          maxLat: { $max: { $arrayElemAt: ['$coordinates', 1] } },
        },
      },
      {
        $project: {
          _id: 0,
          bounds: {
            southwest: {
              lng: '$minLng',
              lat: '$minLat',
            },
            northeast: {
              lng: '$maxLng',
              lat: '$maxLat',
            },
          },
        },
      },
    ];

    const result = await this.zipcodeModel.aggregate(pipeline).exec();
    return result[0]?.bounds || null;
  }

  async searchByPrefix(prefix: string, limit: number = 20) {
    return this.zipcodeModel
      .find({
        zipcode_id: { $regex: `^${prefix}`, $options: 'i' },
      })
      .select('zipcode_id')
      .limit(limit)
      .sort({ zipcode_id: 1 })
      .exec();
  }
}
