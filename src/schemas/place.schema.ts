import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import type { GeoJSONPoint } from '../common/types/geo.types';

export type PlaceDocument = Place & Document;

@Schema({ timestamps: true })
export class Place {
  @Prop({ required: true, unique: true })
  place_id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  street_address: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

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
  industry: string;

  @Prop({ default: false })
  isTradeAreaAvailable: boolean;

  @Prop({ default: false })
  isHomeZipcodesAvailable: boolean;
}

export const PlaceSchema = SchemaFactory.createForClass(Place);

// Create 2dsphere index for geospatial queries
PlaceSchema.index({ location: '2dsphere' });
PlaceSchema.index({ place_id: 1 }, { unique: true });
PlaceSchema.index({ industry: 1 });
PlaceSchema.index({ city: 1, state: 1 });
