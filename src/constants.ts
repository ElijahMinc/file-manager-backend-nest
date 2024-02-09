const TEN_MB = 10;

export const EXPIRES_IN_ACCESS_TOKEN = '1d';
export const EXPIRES_IN_REFRESH_TOKEN = '2d';

export const UPLOAD_FILE_MAX_SIZE = TEN_MB * 1024 * 1024;
export const UPLOAD_FILE_TYPES_REGEX = '.(png|jpeg|jpg)';
export const UPLOAD_VALIDATION_FAILED_MESSAGE =
  'Validation failed (expected size is less than 10mb)';

export const MAX_FILE_SIZE_VALIDATOR_CONFIG = {
  maxSize: UPLOAD_FILE_MAX_SIZE,
  message: UPLOAD_VALIDATION_FAILED_MESSAGE,
};

export const FILE_TYPE_VALIDATOR_CONFIG = { fileType: UPLOAD_FILE_TYPES_REGEX };
