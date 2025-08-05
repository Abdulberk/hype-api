import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import type { GeoJSONPolygon } from '../common/types/geo.types';

export type TradeAreaDocument = TradeArea & Document;

@Schema({ timestamps: true })
export class TradeArea {
  @Prop({ required: true })
  place_id: string;

  @Prop({
    type: {
      type: String,
      enum: ['Polygon', 'MultiPolygon'],
      required: true,
    },
    coordinates: {
      type: [[[Number]]],
      required: true,
    },
  })
  polygon: GeoJSONPolygon;

  @Prop({ required: true, enum: [30, 50, 70] })
  trade_area_percentage: number;
}

export const TradeAreaSchema = SchemaFactory.createForClass(TradeArea);

// Create indexes for performance
TradeAreaSchema.index({ polygon: '2dsphere' });
TradeAreaSchema.index({ place_id: 1, trade_area_percentage: 1 });
TradeAreaSchema.index({ place_id: 1 });
