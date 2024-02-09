import { File } from 'src/file/entities/file.entity';
import { RefreshToken } from 'src/token/entities/token.entity';
import { Nullable } from 'src/types/nullable.type';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  name: Nullable<string> = null;

  @Column()
  email: string;

  @Column()
  password: string;

  @OneToOne(() => RefreshToken, (tokenModel) => tokenModel.user, {
    onDelete: 'CASCADE',
  })
  refreshToken: string;

  @OneToMany(() => File, (fileModel) => fileModel.user, {
    onDelete: 'CASCADE',
  })
  file: File;

  @CreateDateColumn() // дата создания пользователя
  createdAt: Date;

  @UpdateDateColumn() // дата обновления пользователя
  updatedAt: Date;
}
