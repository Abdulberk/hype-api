import { IsOptional, IsEnum, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export enum TradeAreaPercentage {
  THIRTY = 30,
  FIFTY = 50,
  SEVENTY = 70,
}

export class TradeAreaQueryDto {
  @IsOptional()
  @IsEnum(TradeAreaPercentage)
  @Transform(({ value }) => parseInt(value))
  percentage?: TradeAreaPercentage;
}

export class TradeAreaParamsDto {
  @IsString()
  placeId: string;

  @IsOptional()
  @IsEnum(TradeAreaPercentage)
  @Transform(({ value }) => parseInt(value))
  percentage?: TradeAreaPercentage;
}
