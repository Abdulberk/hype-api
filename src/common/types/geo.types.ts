export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface GeoJSONPolygon {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: number[][][];
}

export interface LocationPercentage {
  [zipcode: string]: number;
}

export enum TradeAreaPercentage {
  LOW = 30,
  MEDIUM = 50,
  HIGH = 70,
}
