import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateClassDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  activity: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  room: string;

  @IsDateString()
  @IsNotEmpty()
  startsAt: string;

  @IsInt()
  @Min(1)
  spots: number;

  @IsInt()
  @Min(1)
  trainerId: number;
}
