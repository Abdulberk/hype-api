import { IsOptional, IsArray, IsString, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class ZipcodeQueryDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(s => s.trim());
    }
    return value;
  })
  zipcodes?: string[]; // Bulk zipcode IDs

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 100;
}

export class ZipcodeBulkDto {
  @IsArray()
  @IsString({ each: true })
  zipcodes!: string[]; // Required array of zipcode IDs
}

export class ZipcodeGeoQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Transform(({ value }) => parseFloat(value))
  longitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Transform(({ value }) => parseFloat(value))
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(100)
  @Transform(({ value }) => parseFloat(value))
  radius?: number; // kilometers

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 50;
}