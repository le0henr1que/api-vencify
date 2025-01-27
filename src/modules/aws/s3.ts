import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';

import { AWSService } from './aws.service';

@Injectable()
export class S3Service extends AWSService {
  private s3Client: S3Client;
  protected bucket: string;

  constructor() {
    super();
    this.config();

    if (!process.env.AWS_BUCKET_NAME || !process.env.AWS_BUCKET_REGION) {
      console.error(
        'Variáveis de ambiente AWS_BUCKET_NAME ou AWS_BUCKET_REGION não estão definidas',
      );
      throw new Error(
        'Variáveis de ambiente AWS_BUCKET_NAME ou AWS_BUCKET_REGION não estão definidas',
      );
    }

    this.bucket = process.env.AWS_BUCKET_NAME;
    this.s3Client = new S3Client({
      region: process.env.AWS_BUCKET_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    // Verificar se o S3Client foi inicializado
    if (!this.s3Client) {
      console.error('Falha ao inicializar S3Client');
      throw new Error('Falha ao inicializar S3Client');
    }
  }

  public async uploadFile(
    bucketName: string,
    key: string,
    fileBuffer: Buffer,
  ): Promise<void> {
    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: bucketName ?? this.bucket,
        Key: key,
        Body: fileBuffer,
      },
    });

    try {
      await upload.done();
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
    const command = new GetObjectCommand({
      Bucket: bucket ?? this.bucket,
      Key: key,
      ...(ResponseContentDisposition && { ResponseContentDisposition }),
      ...(ResponseContentType && { ResponseContentType }),
    });

    try {
      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: 900,
      });
      return url;
    } catch (error) {
      console.error('Erro ao gerar URL assinada: ', error);
      throw error;
    }
  }

  public async getFile(bucketName: string, key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: bucketName ?? this.bucket,
      Key: key,
    });

    try {
      const { Body } = await this.s3Client.send(command);
      const chunks: Uint8Array[] = [];
      if (Body instanceof ReadableStream) {
        const reader = Body.getReader();
        let done: boolean;
        do {
          const { value, done: readingDone } = await reader.read();
          if (value) chunks.push(value);
          done = readingDone;
        } while (!done);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      console.error('Erro ao obter arquivo do S3: ', error);
      throw error;
    }
  }
}
