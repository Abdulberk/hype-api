import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import type { GeoJSONPolygon } from '../common/types/geo.types';

export type ZipcodeDocument = Zipcode & Document;

@Schema({ timestamps: true })
export class Zipcode {
  @Prop({ required: true, unique: true })
  zipcode_id: string;

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
}

export const ZipcodeSchema = SchemaFactory.createForClass(Zipcode);

// Create indexes for performance
ZipcodeSchema.index({ polygon: '2dsphere' });
ZipcodeSchema.index({ zipcode_id: 1 }, { unique: true });
