import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([File]),
    CloudinaryModule,
    UserModule,
  ],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
