import { NestFactory } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Module, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

// Import schemas
import { Place, PlaceSchema } from '../src/schemas/place.schema';
import { TradeArea, TradeAreaSchema } from '../src/schemas/trade-area.schema';
import {
  HomeZipcodes,
  HomeZipcodesSchema,
} from '../src/schemas/home-zipcodes.schema';
import { Competitor, CompetitorSchema } from '../src/schemas/competitor.schema';
import { Zipcode, ZipcodeSchema } from '../src/schemas/zipcode.schema';

@Injectable()
class DataImporter {
  private readonly BATCH_SIZE = 1000;

  constructor(
    @InjectModel(Place.name) private placeModel: Model<Place>,
    @InjectModel(TradeArea.name) private tradeAreaModel: Model<TradeArea>,
    @InjectModel(HomeZipcodes.name)
    private homeZipcodesModel: Model<HomeZipcodes>,
    @InjectModel(Competitor.name) private competitorModel: Model<Competitor>,
    @InjectModel(Zipcode.name) private zipcodeModel: Model<Zipcode>,
  ) {}

  async importAll() {
    console.log('🚀 Starting data import process...');

    try {
      await this.clearCollections();
      await this.importMyPlace();
      await this.importZipcodes();
      await this.importCompetitors();
      await this.importHomeZipcodes();
      await this.importTradeAreas();

      console.log('✅ Data import completed successfully!');
    } catch (error) {
      console.error('❌ Import failed:', error);
      process.exit(1);
    }
  }

  private async clearCollections() {
    console.log('🗑️  Clearing existing collections...');
    await Promise.all([
      this.placeModel.deleteMany({}),
      this.tradeAreaModel.deleteMany({}),
      this.homeZipcodesModel.deleteMany({}),
      this.competitorModel.deleteMany({}),
      this.zipcodeModel.deleteMany({}),
    ]);
    console.log('✅ Collections cleared');
  }

  private async importMyPlace() {
    console.log('📍 Importing my place...');
    const filePath = path.join(__dirname, '../data/my_place.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const place = {
      place_id: data.id,
      name: data.name,
      street_address: data.street_address,
      city: data.city,
      state: data.state,
      logo: data.logo,
      location: {
        type: 'Point',
        coordinates: [data.longitude, data.latitude],
      },
      industry: data.industry,
      isTradeAreaAvailable: data.isTradeAreaAvailable,
      isHomeZipcodesAvailable: data.isHomeZipcodesAvailable,
    };

    await this.placeModel.create(place);
    console.log('✅ My place imported');
  }

  private async importZipcodes() {
    console.log('📮 Importing zipcodes...');
    const filePath = path.join(__dirname, '../data/zipcodes.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const batch: any[] = [];
    for (const item of data) {
      batch.push({
        zipcode_id: item.id,
        polygon: JSON.parse(item.polygon),
      });

      if (batch.length >= this.BATCH_SIZE) {
        await this.processBatch(this.zipcodeModel, batch);
        batch.length = 0;
      }
    }

    if (batch.length > 0) {
      await this.processBatch(this.zipcodeModel, batch);
    }

    console.log(`✅ Zipcodes imported: ${data.length} records`);
  }

  private async importCompetitors() {
    console.log('🏢 Importing competitors...');
    const filePath = path.join(__dirname, '../data/competitors.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const batch: any[] = [];
    for (const item of data) {
      batch.push({
        place_id: item.pid,
        name: item.name,
        street_address: item.street_address,
        city: item.city,
        region: item.region,
        logo: item.logo,
        location: {
          type: 'Point',
          coordinates: [item.longitude, item.latitude],
        },
        sub_category: item.sub_category,
        trade_area_activity: item.trade_area_activity,
        home_locations_activity: item.home_locations_activity,
        distance: item.distance,
      });

      if (batch.length >= this.BATCH_SIZE) {
        await this.processBatch(this.competitorModel, batch);
        batch.length = 0;
      }
    }

    if (batch.length > 0) {
      await this.processBatch(this.competitorModel, batch);
    }

    console.log(`✅ Competitors imported: ${data.length} records`);
  }

  private async importHomeZipcodes() {
    console.log('🏠 Importing home zipcodes...');
    const filePath = path.join(__dirname, '../data/home_zipcodes.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const batch: any[] = [];
    for (const item of data) {
      batch.push({
        place_id: item.pid,
        zipcode_percentages: item.locations,
      });

      if (batch.length >= this.BATCH_SIZE) {
        await this.processBatch(this.homeZipcodesModel, batch);
        batch.length = 0;
      }
    }

    if (batch.length > 0) {
      await this.processBatch(this.homeZipcodesModel, batch);
    }

    console.log(`✅ Home zipcodes imported: ${data.length} records`);
  }

  private async importTradeAreas() {
    console.log('📊 Importing trade areas (large file)...');
    const filePath = path.join(__dirname, '../data/trade_areas.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const batch: any[] = [];
    let processed = 0;
    const total = data.length;

    for (const item of data) {
      batch.push({
        place_id: item.pid,
        polygon: JSON.parse(item.polygon),
        trade_area_percentage: item.trade_area,
      });

      if (batch.length >= this.BATCH_SIZE) {
        await this.processBatch(this.tradeAreaModel, batch);
        processed += batch.length;
        console.log(
          `Progress: ${processed}/${total} (${((processed / total) * 100).toFixed(1)}%)`,
        );
        batch.length = 0;
      }
    }

    if (batch.length > 0) {
      await this.processBatch(this.tradeAreaModel, batch);
      processed += batch.length;
    }

    console.log(`✅ Trade areas imported: ${total} records`);
  }

  private async processBatch(model: Model<any>, batch: any[]) {
    try {
      await model.insertMany(batch, {
        ordered: false,
      });
    } catch (error: any) {
      console.error(`Batch insert error for ${model.modelName}:`, error.message);
    }
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI!),
    MongooseModule.forFeature([
      { name: Place.name, schema: PlaceSchema },
      { name: TradeArea.name, schema: TradeAreaSchema },
      { name: HomeZipcodes.name, schema: HomeZipcodesSchema },
      { name: Competitor.name, schema: CompetitorSchema },
      { name: Zipcode.name, schema: ZipcodeSchema },
    ]),
  ],
  providers: [DataImporter],
})
class ImportModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(ImportModule);
  const importer = app.get(DataImporter);

  await importer.importAll();
  await app.close();
}

bootstrap().catch(console.error);
