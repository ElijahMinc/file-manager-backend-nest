import {
  UploadApiErrorResponse,
  UploadApiResponse,
  v2 as cloudinary,
} from 'cloudinary';
import { Injectable } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const streamifier = require('streamifier');

export type CloudinaryResponse = UploadApiResponse | UploadApiErrorResponse;

@Injectable()
export class CloudinaryService {
  constructor() {}

  uploadFile(
    file: Express.Multer.File,
    public_id: string,
    folder: string,
  ): Promise<CloudinaryResponse> {
    console.log('file', file);
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id,
          unique_filename: true,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
