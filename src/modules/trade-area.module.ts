import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TradeAreaController } from '../controllers/trade-area.controller';
import { TradeAreaService } from '../services/trade-area.service';
import { TradeArea, TradeAreaSchema } from '../schemas/trade-area.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TradeArea.name, schema: TradeAreaSchema },
    ]),
  ],
  controllers: [TradeAreaController],
  providers: [TradeAreaService],
  exports: [TradeAreaService],
})
export class TradeAreaModule {}