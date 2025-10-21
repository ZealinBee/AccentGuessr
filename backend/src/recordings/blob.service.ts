import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BlobServiceClient } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class BlobService {
  private blobServiceClient: BlobServiceClient;
  private containerName: string;

  constructor() {
    const conn = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!conn) throw new Error('AZURE_STORAGE_CONNECTION_STRING not set');
    this.blobServiceClient = BlobServiceClient.fromConnectionString(conn);
    this.containerName = process.env.AZURE_BLOB_CONTAINER || 'recordings';
  }

  async uploadRecording(
    file: Express.Multer.File,
    quoteId: string | number,
    nativeLanguage: string,
    countryOfOrigin?: string,
  ): Promise<string> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(
        this.containerName,
      );
      await containerClient.createIfNotExists({ access: 'container' });

      const extension = path.extname(file.originalname) || '.mp3';
      const randomId = uuidv4();

      const filename =
        [randomId, quoteId, nativeLanguage, countryOfOrigin]
          .filter(Boolean) // remove undefined
          .join('-')
          .replace(/\s+/g, '_') + extension;

      // sub folders
      const blobPath = `${nativeLanguage}/${filename}`;

      const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
      await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: { blobContentType: file.mimetype },
      });

      console.log(`Uploaded to Azure Blob: ${blobPath}`);

      return blockBlobClient.url;
    } catch (err) {
      console.error(' Azure upload failed:', err);
      throw new InternalServerErrorException(
        'Error uploading to Azure Blob Storage',
      );
    }
  }
}
