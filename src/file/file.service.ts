import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FILE_TYPES, File } from './entities/file.entity';
import { Repository } from 'typeorm';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CreateFileDto } from './dto/create-file.dto';
import { User } from 'src/user/entities/user.entity';
import * as path from 'path';
import { UserService } from 'src/user/user.service';
import { Nullable } from 'src/types/nullable.type';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private cloudinaryService: CloudinaryService,
    private userService: UserService,
  ) {}

  async updateFileById(id: File['id'], file: File) {
    const findedFile = await this.fileRepository.findOne({
      where: {
        id,
      },
    });

    if (!findedFile) {
      return null;
    }

    await this.fileRepository.update(id, file);
  }

  async uploadFile({
    file,
    fileDto,
    userId,
  }: {
    file: Express.Multer.File;
    fileDto: CreateFileDto;
    userId: User['id'];
  }) {
    if (fileDto.type === FILE_TYPES.FILE) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { parent_dir_id: _, ...restNewFile } = await this.createFile({
        file,
        fileDto,
        userId,
      });

      try {
        const uploadedCloudinaryFile = await this.cloudinaryService.uploadFile(
          file,
          file.originalname,
          restNewFile.path.split(path.sep).join('/'),
        );

        restNewFile.preview_url = uploadedCloudinaryFile.url;

        await this.updateFileById(restNewFile.id, restNewFile);
      } catch (error) {
        console.log('ERROR CLOUDINARY', error);
        throw new BadRequestException('Invalid file type.');
      }

      return await this.fileRepository.findOne({
        where: {
          id: restNewFile.id,
        },
      });
    }

    if (fileDto.type === FILE_TYPES.DIR) {
      return this.createDir({ fileDto, userId });
    }

    throw new NotAcceptableException('Something went wrong');
  }

  async createDir({
    fileDto,
    userId,
  }: {
    fileDto: CreateFileDto;
    userId: User['id'];
  }) {}

  async createFile({
    file,
    fileDto,
    userId,
  }: {
    file: Express.Multer.File;
    fileDto: CreateFileDto;
    userId: User['id'];
  }) {
    const fileIsExist = await this.fileRepository.findOne({
      where: {
        name: file.originalname,
      },
    });

    if (!!fileIsExist) {
      throw new BadRequestException('This file is already exist.');
    }

    let parentFile: Nullable<File> = null;

    if (!!fileDto.parent_dir_id) {
      parentFile = await this.fileRepository.findOne({
        where: {
          parent_dir_id: fileDto.parent_dir_id,
        },
      });
    }

    const user = await this.userService.findOneById(userId);

    const newFile = this.fileRepository.create({
      name: file.originalname,
      size: file.size,
      type: FILE_TYPES.FILE,
      parent_dir_id: fileDto.parent_dir_id || null,
      path: '',
      user,
    });

    let pathnameFile = this.getDefaultFilePath(userId);

    if (!!parentFile) {
      const pathParentFile = path.sep + parentFile.path;
      pathnameFile += pathParentFile;
    }

    newFile.path = pathnameFile;

    await this.fileRepository.save(newFile);

    return newFile;
  }

  getDefaultFilePath(userId: User['id']) {
    return this.rootFolder + path.sep + userId;
  }

  get rootFolder() {
    return 'file-manager';
  }
}
