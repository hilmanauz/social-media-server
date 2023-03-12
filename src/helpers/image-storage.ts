import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import fs from 'fs';

type ValidFileExtension = 'png' | 'jpg' | 'jpeg';
type ValidMimeType = 'image/png' | 'image/jpg' | 'image/jpeg';

const validFileExtensions: ValidFileExtension[] = ['png', 'jpg', 'jpeg'];

const validMimeTypes: ValidMimeType[] = [
  'image/png',
  'image/jpg',
  'image/jpeg',
];

export const saveImageToStorage: MulterOptions = {
  storage: diskStorage({
    destination: './src/images',
    filename: (req, file, cb) => {
      const fileExtension: string = path.extname(file.originalname);
      const fileName: string = uuidv4() + fileExtension;
      cb(null, fileName);
    },
  }),
  fileFilter: (_, file, cb) => {
    const allowedMimeTypes: ValidMimeType[] = validMimeTypes;
    allowedMimeTypes.includes(file.mimetype as ValidMimeType)
      ? cb(null, true)
      : cb(null, false);
  },
};

export const isFileExtensionSafe = async (
  fullFilePath: string,
): Promise<boolean> => {
  const { fileTypeFromFile } = await (eval('import("file-type")') as Promise<
    typeof import('file-type')
  >);

  const fileExtensionAndMimeType = (await fileTypeFromFile(fullFilePath)) as {
    ext: ValidFileExtension;
    mime: ValidMimeType;
  };
  if (!fileExtensionAndMimeType) return false;
  const isFileTypeLegit = validFileExtensions.includes(
    fileExtensionAndMimeType.ext,
  );
  const isMimeTypeLegit = validMimeTypes.includes(
    fileExtensionAndMimeType.mime,
  );
  return isFileTypeLegit && isMimeTypeLegit;
};

export const removeFile = (fullFilePath: string): void => {
  try {
    fs.unlinkSync(fullFilePath);
  } catch (error) {
    console.error(error);
  }
};
