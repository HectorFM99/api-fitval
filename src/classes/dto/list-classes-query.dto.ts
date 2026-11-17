import { IsInt, IsOptional, Min, Max, IsIn, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export const SORT_COLUMNS: Record<string, string> = {
  startsAt: 'c.starts_at',
  activity: 'c.activity',
  spots: 'c.spots',
};

export class ListClassesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @IsOptional()
  @IsString()
  @IsIn(['startsAt', 'activity', 'spots'])
  sort?: string;

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  order?: string;

  @IsOptional()
  @IsString()
  activity?: string;
}

export interface GymClassPage {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
