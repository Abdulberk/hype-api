import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompetitorController } from '../controllers/competitor.controller';
import { CompetitorService } from '../services/competitor.service';
import {
  Competitor,
  CompetitorSchema,
} from '../schemas/competitor.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Competitor.name, schema: CompetitorSchema },
    ]),
  ],
  controllers: [CompetitorController],
  providers: [CompetitorService],
  exports: [CompetitorService],
})
export class CompetitorModule {}