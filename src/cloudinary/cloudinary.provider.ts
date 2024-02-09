import { ConfigService } from '@nestjs/config';
import { v2 } from 'cloudinary';
import { CLOUDINARY } from 'src/constants/cloudinary';

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    return v2.config({
      cloud_name: configService.get('CLOUD_NAME'),
      api_key: configService.get('CLOUD_API_KEY'),
      api_secret: configService.get('CLOUD_API_SECRET'),
    });
  },
};
