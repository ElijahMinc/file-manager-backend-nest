import { Nullable } from 'src/types/nullable.type';
import { FILE_TYPES } from '../entities/file.entity';
import { IsEnum, MinLength } from 'class-validator';
import { Column } from 'typeorm';

export class CreateDirDto {
  @MinLength(1, {
    message: 'Name is too short',
  })
  name: string;

  @IsEnum(FILE_TYPES)
  type: string;

  @Column({
    default: null,
  })
  parent_dir_id: Nullable<number>;

  @Column({
    default: '',
  })
  path: string;
}
