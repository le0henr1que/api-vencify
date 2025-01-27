import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class LocalService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(__dirname, '..', '..', 'uploads');

    // Ensure the upload directory exists
    fs.mkdir(this.uploadDir, { recursive: true }).catch(console.error);
  }

  public async uploadFile(
    bucketName: string,
    key: string,
    fileBuffer: Buffer,
  ): Promise<void> {
    const filePath = path.join(this.uploadDir, bucketName, key);

    try {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, fileBuffer);
      console.log('Upload realizado com sucesso');
    } catch (error) {
      console.error('Erro ao fazer upload do arquivo: ', error);
      throw error;
    }
  }

  public async getUrl(
    key: string,
    bucket: string,
    ResponseContentDisposition?: string,
    ResponseContentType?: string,
  ): Promise<string> {
    const filePath = path.join(this.uploadDir, bucket, key);

    try {
      await fs.access(filePath);
      return filePath;
    } catch (error) {
      console.error('Erro ao gerar URL do arquivo: ', error);
      throw error;
    }
  }

  public async getFile(bucketName: string, key: string): Promise<Buffer> {
    const filePath = path.join(this.uploadDir, bucketName, key);

    try {
      const fileBuffer = await fs.readFile(filePath);
      return fileBuffer;
    } catch (error) {
      console.error('Erro ao obter arquivo: ', error);
      throw error;
    }
  }
}
