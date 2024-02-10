import { Nullable } from 'src/types/nullable.type';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum FILE_TYPES {
  FILE = 'file',
  DIR = 'dir',
}

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  type: FILE_TYPES;

  @Column({
    default: 0,
  })
  size: number;

  @Column()
  path: string;

  @OneToOne(() => File, (fileModel) => fileModel, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  parent_dir_id?: Nullable<number>;

  @ManyToOne(() => User, (user) => user.file)
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @Column({
    default: '',
  })
  preview_url: string;

  @CreateDateColumn() // дата создания пользователя
  createdAt: Date;

  @UpdateDateColumn() // дата обновления пользователя
  updatedAt: Date;
}
