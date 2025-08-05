import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import type { GeoJSONPoint } from '../common/types/geo.types';

export type CompetitorDocument = Competitor & Document;

@Schema({ timestamps: true })
export class Competitor {
  @Prop({ required: true })
  place_id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  street_address: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  region: string;

  @Prop()
  logo: string;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  })
  location: GeoJSONPoint;

  @Prop({ required: true })
  sub_category: string;

  @Prop({ default: false })
  trade_area_activity: boolean;

  @Prop({ default: false })
  home_locations_activity: boolean;

  @Prop({ required: true })
  distance: number;
}

export const CompetitorSchema = SchemaFactory.createForClass(Competitor);

// Create indexes for performance
CompetitorSchema.index({ location: '2dsphere' });
CompetitorSchema.index({ place_id: 1 });
CompetitorSchema.index({ sub_category: 1 });
CompetitorSchema.index({ distance: 1 });
