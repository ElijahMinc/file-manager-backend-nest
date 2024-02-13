import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FILE_TYPES, File } from './entities/file.entity';
import { IsNull, Repository } from 'typeorm';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CreateFileDto } from './dto/create-file.dto';
import { User } from 'src/user/entities/user.entity';
import * as path from 'path';
import { UserService } from 'src/user/user.service';
import { Nullable } from 'src/types/nullable.type';
import { CreateDirDto } from './dto/create-dir-dto';

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
    if (!file) {
      throw new BadRequestException('File is required');
    }
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

  async createDir({
    dirDto,
    userId,
  }: {
    dirDto: CreateDirDto;
    userId: User['id'];
  }) {
    if (!dirDto?.name) throw new BadRequestException('Invalid folder name');

    const candidateDir = await this.fileRepository.findOne({
      where: {
        name: dirDto.name,
      },
    });

    if (!!candidateDir) {
      throw new BadRequestException('This folder is already exist');
    }

    const Owner = await this.userService.findOneById(userId);

    const newFolder = this.fileRepository.create({
      name: dirDto.name,
      type: FILE_TYPES.DIR,
      parent_dir_id: null,
      user: Owner,
    });

    let parentDir: Nullable<File> = null;

    if (dirDto.parent_dir_id) {
      parentDir = await this.fileRepository.findOne({
        where: {
          parent_dir_id: dirDto.parent_dir_id,
        },
      });
    }

    let pathDir = '';

    if (!!parentDir) {
      pathDir = parentDir.path + path.sep + newFolder.name;
      newFolder.parent_dir_id = parentDir.id;
      newFolder.path = pathDir;
    }

    newFolder.path =
      this.getDefaultFilePath(userId) + path.sep + newFolder.name;

    await this.fileRepository.save(newFolder);

    try {
      await this.cloudinaryService.createDir(
        newFolder.path.replace(/\\/g, '/'),
      );
    } catch (error) {
      console.log('CLOUDINARY CREATION DIR', error);
    }

    return await this.fileRepository.findOne({
      where: {
        id: newFolder.id,
      },
      select: {
        name: true,
        id: true,
        path: true,
        parent_dir_id: true,
        type: true,
        size: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteDir({ folderId }: { folderId: File['id'] }) {
    const candidate = await this.fileRepository.findOne({
      where: {
        id: folderId,
      },
    });
    if (!candidate) {
      throw new BadRequestException('This folder was not found');
    }

    const paths = candidate.path.split(path.sep);
    const isNotEmptyFolder = paths.at(-1) !== candidate.name;

    if (isNotEmptyFolder) {
      throw new BadRequestException('This folder is not empty!');
    }

    try {
      await this.cloudinaryService.deleteDir(
        candidate.path.replace(/\\/g, '/'),
      );
    } catch (error) {
      console.log(
        'CLOUDINARY: SOMETHING WENT WRONG WITH DELETING FOLDER',
        error,
      );
    }
    await this.fileRepository.remove(candidate);

    return;
  }

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
        parent_dir_id: !!fileDto?.parent_dir_id ? +fileDto.parent_dir_id : null,
      },
    });

    if (!!fileIsExist) {
      throw new BadRequestException('This file is already exist.');
    }

    let parentFile: Nullable<File> = null;

    if (!!fileDto?.parent_dir_id) {
      parentFile = await this.fileRepository.findOne({
        where: {
          type: FILE_TYPES.DIR,
          id: +fileDto.parent_dir_id,
        },
      });
    }

    const user = await this.userService.findOneById(userId);

    const newFile = this.fileRepository.create({
      name: file.originalname,
      size: file.size,
      type: FILE_TYPES.FILE,
      parent_dir_id: !!fileDto?.parent_dir_id ? +fileDto?.parent_dir_id : null,
      path: '',
      user,
    });

    let pathnameFile: File['path'] = '';

    if (!!parentFile) {
      // const pathParentFile = path.sep + parentFile.path;
      pathnameFile += parentFile.path;
    }

    newFile.path = pathnameFile;

    await this.fileRepository.save(newFile);

    return newFile;
  }

  async findAll({
    userId,
    parent_dir_id,
  }: {
    userId: User['id'];
    parent_dir_id?: File['id'];
  }) {
    return await this.fileRepository.find({
      where: {
        user: {
          id: userId,
        },
        parent_dir_id: !!parent_dir_id ? +parent_dir_id : IsNull(),
      },
    });
  }

  getDefaultFilePath(userId: User['id']) {
    return this.rootFolder + path.sep + userId;
  }

  get rootFolder() {
    return 'file-manager';
  }
}
