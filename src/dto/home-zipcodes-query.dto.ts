import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class HomeZipcodesQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Transform(({ value }) => parseFloat(value))
  minPercentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Transform(({ value }) => parseFloat(value))
  maxPercentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 50;
}

export class PercentileAnalysisDto {
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(20)
  @Transform(({ value }) => parseInt(value))
  groups?: number = 5; // Default 5 groups for percentile analysis
}