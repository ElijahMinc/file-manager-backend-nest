import { IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @MinLength(5, {
    message: 'Password is too short',
  })
  password: string;
}
