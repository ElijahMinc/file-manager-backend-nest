import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Query,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileService } from './file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CreateFileDto } from './dto/create-file.dto';
import {
  FILE_TYPE_VALIDATOR_CONFIG,
  MAX_FILE_SIZE_VALIDATOR_CONFIG,
} from 'src/constants';
import { CreateDirDto } from './dto/create-dir-dto';
import { File } from './entities/file.entity';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req, @Query('parent_dir_id') parent_dir_id?: File['id']) {
    return this.fileService.findAll({
      userId: req.user.id,
      parent_dir_id,
    });
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {}))
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator(MAX_FILE_SIZE_VALIDATOR_CONFIG),
          new FileTypeValidator(FILE_TYPE_VALIDATOR_CONFIG),
        ],
        fileIsRequired: false,
      }),
    )
    file: Express.Multer.File,
    @Body(new ValidationPipe()) createFileDto: CreateFileDto,
    @Request() req,
  ) {
    return this.fileService.uploadFile({
      file,
      fileDto: createFileDto,
      userId: req.user.id,
    });
  }

  @Delete('dir/:id')
  @UseGuards(JwtAuthGuard)
  deleteDir(@Param('id') id: string, @Res() res) {
    this.fileService.deleteDir({
      folderId: +id,
    });

    return res.status(200).json({
      message: 'Success',
    });
  }

  @Post('dir')
  @UseGuards(JwtAuthGuard)
  createDir(
    @Body(new ValidationPipe()) createDirDto: CreateDirDto,
    @Request() req,
  ) {
    return this.fileService.createDir({
      dirDto: createDirDto,
      userId: req.user.id,
    });
  }
}
