import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HomeZipcodesController } from '../controllers/home-zipcodes.controller';
import { HomeZipcodesService } from '../services/home-zipcodes.service';
import { HomeZipcodes, HomeZipcodesSchema } from '../schemas/home-zipcodes.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HomeZipcodes.name, schema: HomeZipcodesSchema },
    ]),
  ],
  controllers: [HomeZipcodesController],
  providers: [HomeZipcodesService],
  exports: [HomeZipcodesService],
})
export class HomeZipcodesModule {}