import {
  IsOptional,
  IsNumber,
  IsString,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CompetitorQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  @Transform(({ value }) => parseInt(value))
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(100)
  @Transform(({ value }) => parseFloat(value))
  maxDistance?: number; // kilometers

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((s: string) => s.trim());
    }
    return Array.isArray(value) ? (value as string[]) : [];
  })
  industries?: string[]; // sub_category filter

  @IsOptional()
  @IsString()
  search?: string; // name or address search
}

export class CompetitorRadiusDto {
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(100)
  @Transform(({ value }) => parseFloat(value))
  radius?: number = 5; // kilometers

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  @Transform(({ value }) => parseInt(value))
  limit?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((s: string) => s.trim());
    }
    return Array.isArray(value) ? (value as string[]) : [];
  })
  industries?: string[];
}
