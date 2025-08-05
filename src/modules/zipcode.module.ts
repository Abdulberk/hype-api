import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ZipcodeController } from '../controllers/zipcode.controller';
import { ZipcodeService } from '../services/zipcode.service';
import { Zipcode, ZipcodeSchema } from '../schemas/zipcode.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Zipcode.name, schema: ZipcodeSchema }]),
  ],
  controllers: [ZipcodeController],
  providers: [ZipcodeService],
  exports: [ZipcodeService],
})
export class ZipcodeModule {}
