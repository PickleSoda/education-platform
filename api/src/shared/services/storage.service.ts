import path from 'node:path';
import fs from 'node:fs/promises';
import { v4 as uuidv4 } from 'uuid';
import type { Express } from 'express';

interface StorageConfig {
  useS3?: boolean;
  s3Bucket?: string;
  s3Region?: string;
  s3AccessKey?: string;
  s3SecretKey?: string;
  localStoragePath?: string;
}

interface UploadResult {
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  url?: string;
}

/**
 * Storage service that handles file uploads to either S3 bucket or local filesystem
 */
class StorageService {
  private config: StorageConfig;
  private s3Client: any = null;

  constructor() {
    this.config = {
      useS3: !!process.env.S3_BUCKET_NAME,
      s3Bucket: process.env.S3_BUCKET_NAME,
      s3Region: process.env.S3_REGION || 'us-east-1',
      s3AccessKey: process.env.S3_ACCESS_KEY,
      s3SecretKey: process.env.S3_SECRET_KEY,
      localStoragePath: process.env.LOCAL_STORAGE_PATH || './uploads',
    };

    if (this.config.useS3) {
      this.initializeS3();
    } else {
      this.initializeLocalStorage();
    }
  }

  private async initializeS3() {
    try {
      // Lazy load AWS SDK only if needed
      const AWS = await import('@aws-sdk/client-s3');
      this.s3Client = new AWS.S3Client({
        region: this.config.s3Region,
        credentials: {
          accessKeyId: this.config.s3AccessKey!,
          secretAccessKey: this.config.s3SecretKey!,
        },
      });
      console.log('✅ S3 storage initialized');
    } catch (error) {
      console.warn('⚠️  S3 initialization failed, falling back to local storage:', error);
      this.config.useS3 = false;
      await this.initializeLocalStorage();
    }
  }

  private async initializeLocalStorage() {
    try {
      await fs.mkdir(this.config.localStoragePath!, { recursive: true });
      console.log('✅ Local file storage initialized at:', this.config.localStoragePath);
    } catch (error) {
      console.error('❌ Failed to initialize local storage:', error);
      throw error;
    }
  }

  /**
   * Upload a file to storage
   */
  async uploadFile(file: Express.Multer.File, folder: string = 'resources'): Promise<UploadResult> {
    const fileName = `${folder}/${uuidv4()}${path.extname(file.originalname)}`;

    if (this.config.useS3 && this.s3Client) {
      return await this.uploadToS3(file, fileName);
    } else {
      return await this.uploadToLocal(file, fileName);
    }
  }

  /**
   * Upload file to S3 bucket
   */
  private async uploadToS3(file: Express.Multer.File, fileName: string): Promise<UploadResult> {
    const { PutObjectCommand } = await import('@aws-sdk/client-s3');

    const command = new PutObjectCommand({
      Bucket: this.config.s3Bucket!,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    const url = `https://${this.config.s3Bucket}.s3.${this.config.s3Region}.amazonaws.com/${fileName}`;

    return {
      fileName: file.originalname,
      filePath: fileName,
      fileSize: file.size,
      mimeType: file.mimetype,
      url,
    };
  }

  /**
   * Upload file to local filesystem
   */
  private async uploadToLocal(file: Express.Multer.File, fileName: string): Promise<UploadResult> {
    const fullPath = path.join(this.config.localStoragePath!, fileName);
    const directory = path.dirname(fullPath);

    // Ensure directory exists
    await fs.mkdir(directory, { recursive: true });

    // Write file
    await fs.writeFile(fullPath, file.buffer);

    return {
      fileName: file.originalname,
      filePath: fileName,
      fileSize: file.size,
      mimeType: file.mimetype,
      url: `/uploads/${fileName}`, // Served by Express static middleware
    };
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(filePath: string): Promise<void> {
    if (this.config.useS3 && this.s3Client) {
      await this.deleteFromS3(filePath);
    } else {
      await this.deleteFromLocal(filePath);
    }
  }

  /**
   * Delete file from S3 bucket
   */
  private async deleteFromS3(filePath: string): Promise<void> {
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');

    const command = new DeleteObjectCommand({
      Bucket: this.config.s3Bucket!,
      Key: filePath,
    });

    await this.s3Client.send(command);
  }

  /**
   * Delete file from local filesystem
   */
  private async deleteFromLocal(filePath: string): Promise<void> {
    const fullPath = path.join(this.config.localStoragePath!, filePath);
    try {
      await fs.unlink(fullPath);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * Get file URL (works for both S3 and local)
   */
  getFileUrl(filePath: string): string {
    if (this.config.useS3) {
      return `https://${this.config.s3Bucket}.s3.${this.config.s3Region}.amazonaws.com/${filePath}`;
    } else {
      return `/uploads/${filePath}`;
    }
  }

  /**
   * Check if using S3 storage
   */
  isUsingS3(): boolean {
    return this.config.useS3 || false;
  }
}

export const storageService = new StorageService();
