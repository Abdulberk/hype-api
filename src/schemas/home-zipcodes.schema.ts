import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import type { LocationPercentage } from '../common/types/geo.types';

export type HomeZipcodesDocument = HomeZipcodes & Document;

@Schema({ timestamps: true })
export class HomeZipcodes {
  @Prop({ required: true, unique: true })
  place_id: string;

  @Prop({ type: [Object], required: true })
  zipcode_percentages: LocationPercentage[];
}

export const HomeZipcodesSchema = SchemaFactory.createForClass(HomeZipcodes);

// Create indexes for performance
HomeZipcodesSchema.index({ place_id: 1 }, { unique: true });
