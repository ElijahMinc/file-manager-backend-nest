import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TokenModule } from './token/token.module';
import { FileModule } from './file/file.module';

@Module({
  imports: [
    UserModule,
    TokenModule,
    AuthModule,
    TokenModule,
    FileModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        synchronize: true,
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        username: configService.get('DB_USERNAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
