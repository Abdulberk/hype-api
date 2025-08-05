import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HomeZipcodes } from '../schemas/home-zipcodes.schema';
import {
  HomeZipcodesQueryDto,
  PercentileAnalysisDto,
} from '../dto/home-zipcodes-query.dto';

@Injectable()
export class HomeZipcodesService {
  constructor(
    @InjectModel(HomeZipcodes.name)
    private homeZipcodesModel: Model<HomeZipcodes>,
  ) {}

  async findByPlaceId(placeId: string, query?: HomeZipcodesQueryDto) {
    const result = await this.homeZipcodesModel
      .findOne({ place_id: placeId })
      .exec();

    if (!result) {
      return [];
    }

    // Extract and process zipcode percentages
    let zipcodes = result.zipcode_percentages.map((item) => {
      const zipcode = Object.keys(item)[0];
      const percentage = parseFloat(
        Object.values(item)[0] as unknown as string,
      );
      return { zipcode, percentage };
    });

    // Apply percentage filtering
    if (query?.minPercentage !== undefined) {
      zipcodes = zipcodes.filter(
        (item) => item.percentage >= query.minPercentage!,
      );
    }
    if (query?.maxPercentage !== undefined) {
      zipcodes = zipcodes.filter(
        (item) => item.percentage <= query.maxPercentage!,
      );
    }

    // Sort by percentage descending
    zipcodes.sort((a, b) => b.percentage - a.percentage);

    // Apply limit
    const limit = query?.limit || 50;
    return zipcodes.slice(0, limit);
  }

  async getZipcodesByPlace(placeId: string) {
    const result = await this.homeZipcodesModel
      .findOne({ place_id: placeId })
      .select('zipcode_percentages')
      .exec();

    if (!result) {
      return [];
    }

    return result.zipcode_percentages
      .map((item) => {
        const zipcode = Object.keys(item)[0];
        const percentage = parseFloat(
          Object.values(item)[0] as unknown as string,
        );
        return { zipcode, percentage };
      })
      .sort((a, b) => b.percentage - a.percentage);
  }

  async getTopZipcodes(placeId: string, topN: number = 10) {
    const result = await this.homeZipcodesModel
      .findOne({ place_id: placeId })
      .exec();

    if (!result) {
      return [];
    }

    const zipcodes = result.zipcode_percentages.map((item) => {
      const zipcode = Object.keys(item)[0];
      const percentage = parseFloat(
        Object.values(item)[0] as unknown as string,
      );
      return { zipcode, percentage };
    });

    return zipcodes
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, topN);
  }

  async getPercentileAnalysis(placeId: string, query?: PercentileAnalysisDto) {
    const result = await this.homeZipcodesModel
      .findOne({ place_id: placeId })
      .exec();

    if (!result) {
      return {
        totalCount: 0,
        percentileGroups: [],
        statistics: {
          max: 0,
          min: 0,
          avg: 0,
        },
      };
    }

    const zipcodes = result.zipcode_percentages.map((item) => {
      const percentage = parseFloat(
        Object.values(item)[0] as unknown as string,
      );
      return percentage;
    });

    const groups = query?.groups || 5;
    const totalCount = zipcodes.length;
    const maxPercentage = Math.max(...zipcodes);
    const minPercentage = Math.min(...zipcodes);
    const avgPercentage =
      zipcodes.reduce((sum, p) => sum + p, 0) / totalCount;
    const rangeSize = (maxPercentage - minPercentage) / groups;

    const percentileGroups: Array<{
      group: number;
      range: { min: number; max: number };
      count: number;
      percentage: number;
    }> = [];

    for (let i = 0; i < groups; i++) {
      const minRange = minPercentage + i * rangeSize;
      const maxRange =
        i === groups - 1 ? maxPercentage : minPercentage + (i + 1) * rangeSize;

      const count = zipcodes.filter(
        (p) => p >= minRange && p <= maxRange,
      ).length;

      percentileGroups.push({
        group: i + 1,
        range: {
          min: parseFloat(minRange.toFixed(2)),
          max: parseFloat(maxRange.toFixed(2)),
        },
        count,
        percentage: parseFloat(((count / totalCount) * 100).toFixed(2)),
      });
    }

    return {
      totalCount,
      percentileGroups,
      statistics: {
        max: parseFloat(maxPercentage.toFixed(2)),
        min: parseFloat(minPercentage.toFixed(2)),
        avg: parseFloat(avgPercentage.toFixed(2)),
      },
    };
  }

  async getStats() {
    const results = await this.homeZipcodesModel.find().exec();

    if (!results || results.length === 0) {
      return {
        totalRecords: 0,
        uniquePlacesCount: 0,
        uniqueZipcodesCount: 0,
        statistics: { avg: 0, max: 0, min: 0 },
      };
    }

    let totalRecords = 0;
    const uniquePlaces = new Set<string>();
    const uniqueZipcodes = new Set<string>();
    const allPercentages: number[] = [];

    results.forEach((result) => {
      uniquePlaces.add(result.place_id);
      result.zipcode_percentages.forEach((item) => {
        const zipcode = Object.keys(item)[0];
        const percentage = parseFloat(
          Object.values(item)[0] as unknown as string,
        );
        uniqueZipcodes.add(zipcode);
        allPercentages.push(percentage);
        totalRecords++;
      });
    });

    const avgPercentage =
      allPercentages.reduce((sum, p) => sum + p, 0) / allPercentages.length;
    const maxPercentage = Math.max(...allPercentages);
    const minPercentage = Math.min(...allPercentages);

    return {
      totalRecords,
      uniquePlacesCount: uniquePlaces.size,
      uniqueZipcodesCount: uniqueZipcodes.size,
      statistics: {
        avg: parseFloat(avgPercentage.toFixed(2)),
        max: parseFloat(maxPercentage.toFixed(2)),
        min: parseFloat(minPercentage.toFixed(2)),
      },
    };
  }
}