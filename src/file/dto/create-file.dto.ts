import { Nullable } from 'src/types/nullable.type';
import { FILE_TYPES } from '../entities/file.entity';
import { IsEnum, IsOptional, MinLength } from 'class-validator';
import { Column } from 'typeorm';

export class CreateFileDto {
  @MinLength(1, {
    message: 'Name is too short',
  })
  name: string;

  @IsEnum(FILE_TYPES)
  type: string;

  @MinLength(1, {
    message: 'Size is too short',
  })
  size: number;

  @MinLength(1, {
    message: 'Path is too short',
  })
  path: string;

  @Column({
    default: null,
  })
  parent_dir_id: Nullable<number>;
}
