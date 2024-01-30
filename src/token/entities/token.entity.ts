import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class RefreshToken {
  @PrimaryColumn()
  id: number;

  @OneToOne(() => User, (user) => user)
  @JoinColumn({
    name: 'user',
  })
  user: User;

  @Column()
  refreshToken: string;
}
