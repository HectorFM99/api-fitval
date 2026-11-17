import {
  IsString,
  IsEmail,
  IsArray,
  ArrayMinSize,
  ArrayUnique,
  IsInt,
  Min,
  IsNotEmpty,
  MaxLength,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTrainerDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @Length(9, 9)
  dni: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(150)
  email: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  specialtyIds: number[];
}
