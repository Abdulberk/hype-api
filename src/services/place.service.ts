import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Place, PlaceDocument } from '../schemas/place.schema';
import { PlaceQueryDto, PlaceNearbyDto } from '../dto/place-query.dto';

@Injectable()
export class PlaceService {
  constructor(
    @InjectModel(Place.name) private placeModel: Model<PlaceDocument>,
  ) {}

  async findAll(query: PlaceQueryDto) {
    const {
      latitude,
      longitude,
      radius,
      industry,
      city,
      state,
      page = 1,
      limit = 20,
    } = query;

    const filter: any = {};

    // Geospatial filtering with radius
    if (latitude && longitude && radius) {
      filter.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: radius * 1000, // convert km to meters
        },
      };
    }

    // Text-based filters
    if (industry) {
      filter.industry = { $regex: industry, $options: 'i' };
    }
    if (city) {
      filter.city = { $regex: city, $options: 'i' };
    }
    if (state) {
      filter.state = { $regex: state, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.placeModel
        .find(filter)
        .select('place_id name street_address city state location industry isTradeAreaAvailable isHomeZipcodesAvailable')
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.placeModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(placeId: string) {
    return this.placeModel
      .findOne({ place_id: placeId })
      .lean()
      .exec();
  }

  async findNearby(nearbyDto: PlaceNearbyDto) {
    const { latitude, longitude, radius = 5 } = nearbyDto;

    return this.placeModel
      .find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            $maxDistance: radius * 1000,
          },
        },
      })
      .select('place_id name street_address city location industry distance')
      .limit(50) // Reasonable limit for nearby results
      .lean()
      .exec();
  }

  async getIndustries() {
    return this.placeModel
      .distinct('industry')
      .lean()
      .exec();
  }

  async getCities() {
    return this.placeModel
      .distinct('city')
      .lean()
      .exec();
  }

  async getStats() {
    const [total, industries, cities] = await Promise.all([
      this.placeModel.countDocuments(),
      this.placeModel.distinct('industry'),
      this.placeModel.distinct('city'),
    ]);

    return {
      totalPlaces: total,
      totalIndustries: industries.length,
      totalCities: cities.length,
    };
  }
}