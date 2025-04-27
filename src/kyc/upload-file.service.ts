/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/shared/services/file-upload.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';

const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);
const existsAsync = promisify(fs.exists);

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'kyc');

  constructor() {
    this.ensureUploadDirectoryExists();
  }

  private async ensureUploadDirectoryExists(): Promise<void> {
    try {
      const exists = await existsAsync(this.uploadDir);
      if (!exists) {
        await mkdirAsync(this.uploadDir, { recursive: true });
        this.logger.log(`Created upload directory at ${this.uploadDir}`);
      }
    } catch (error) {
      this.logger.error('Failed to create upload directory', error.stack);
      throw error;
    }
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new Error('No file provided');
    }

    // Generate unique filename with original extension
    const fileExt = path.extname(file.originalname);
    const filename = `${uuidv4()}${fileExt}`;
    const filePath = path.join(this.uploadDir, filename);

    try {
      await writeFileAsync(filePath, file.buffer);
      this.logger.log(`File saved to ${filePath}`);

      // Return relative path for database storage
      return path.join('public', 'kyc', filename);
    } catch (error) {
      this.logger.error(`Failed to save file: ${error.message}`, error.stack);
      throw new Error('Failed to save file');
    }
  }

  async saveMultipleFiles(files: Express.Multer.File[]): Promise<string[]> {
    if (!files || files.length === 0) return [];

    return Promise.all(files.map((file) => this.saveFile(file)));
  }
}
