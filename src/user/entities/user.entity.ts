import { RefreshToken } from 'src/token/entities/token.entity';
import { Nullable } from 'src/types/nullable.type';
import {
  Column,
  CreateDateColumn,
  Entity,
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

  @OneToOne(() => RefreshToken, (tokenModel) => tokenModel, {
    onDelete: 'CASCADE',
  })
  refreshToken: string;

  @CreateDateColumn() // дата создания пользователя
  createdAt: Date;

  @UpdateDateColumn() // дата обновления пользователя
  updatedAt: Date;
}
