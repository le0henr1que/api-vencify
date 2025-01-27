import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { UserPayload } from 'src/auth/models/UserPayload';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { DefaultFilter } from 'src/filters/DefaultFilter';
import {
  getMessage,
  MessagesHelperKey,
  setMessage,
} from 'src/helpers/messages.helper';
import { Languages } from 'src/utils/language-preference';
import { handleError } from 'src/utils/treat.exceptions';

import { S3Service } from '../aws/s3';
import { Paginated } from '../base/interfaces/IPaginated';
import { DefaultFilterFile } from './dto/request/file.filter.dto';
import { FileParamsDto } from './dto/request/file.params.dto';
import { FilePaginationResponse } from './dto/response/file.pagination.response';
import { FileParamsResponseDto } from './dto/response/file.params.dto';
import { FileTypeMap } from './dto/type/file.type.map';
import { FileRepository } from './file.repository';
import { LocalService } from '../aws/multer';

@Injectable()
export class FileService {
  private logger = new Logger(FileService.name);

  constructor(
    protected readonly fileRepository: FileRepository,
    private readonly prisma: PrismaService,
    private readonly s3Service: LocalService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}
  async uploadFile(
    file: Express.Multer.File,
    params: FileParamsDto,
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ): Promise<{ id: string }> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();

    const executeUpdate = async (transaction: Prisma.TransactionClient) => {
      if (!file) {
        throw new Error('File not found');
      }
      this.logger.debug(`${identifierRequest} Uploading file`);
      await this.s3Service.uploadFile(
        process.env.AWS_BUCKET_NAME,
        `${params?.entity_name}/${file.originalname}`,
        file.buffer,
      );

      const result = await transaction.file.create({
        data: {
          entity_id: params.entity_id,
          entity_name: params.entity_name,
          file_name: file.originalname,
          file_type: file.mimetype,
          s3_path: `${params?.entity_name}/${file.originalname}`,
        },
      });

      return { id: result.id };
    };

    try {
      if (optionals?.transaction) {
        this.logger.debug(`${identifierRequest} Executing in transaction`);

        return await executeUpdate(optionals?.transaction);
      } else {
        this.logger.debug(
          `${identifierRequest} Executing outside a transaction`,
        );

        return this.prisma.$transaction(async (newTransaction) => {
          return await executeUpdate(newTransaction);
        });
      }
    } catch (error) {
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }
  async findFilteredAsync(
    entityName: FileParamsResponseDto,
    filter: DefaultFilterFile<FileTypeMap>,
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ): Promise<Paginated<Partial<FilePaginationResponse>>> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    try {
      this.logger.log(`${identifierRequest} Find filtered async`);

      const results = await this.fileRepository.findFilteredAsync(
        entityName,
        filter,
        currentUser,
        optionals?.transaction,
      );

      return results;
    } catch (error) {
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }

  async getSignedUrl(
    id: string,
    ResponseContentDisposition?: string,
    ResponseContentType?: string,
    filter?: DefaultFilter<FileTypeMap>,
    currentUser?: UserPayload,
    languagePreference?: Languages,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ): Promise<string> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    try {
      this.logger.log(`${identifierRequest} Find signed async`);

      const file = await this.prisma.file.findFirst({
        where: {
          id,
        },
      });

      if (!file) {
        this.logger.debug(`${identifierRequest} file not found`);
        throw new NotFoundException(
          setMessage(
            getMessage(MessagesHelperKey.USER_NOT_FOUND, languagePreference),
            id,
          ),
        );
      }

      const bucketName = process.env.AWS_BUCKET_NAME;
      const signedUrl = await this.s3Service.getUrl(
        file.s3_path,
        bucketName,
        ResponseContentDisposition,
        ResponseContentType,
      );
      return signedUrl;
    } catch (error) {
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }

  async returnFile(
    id: string,
    ResponseContentDisposition?: string,
    ResponseContentType?: string,
    filter?: DefaultFilter<FileTypeMap>,
    currentUser?: UserPayload,
    languagePreference?: Languages,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ): Promise<string> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    try {
      this.logger.log(`${identifierRequest} Find signed async`);

      const file = await this.prisma.file.findFirst({
        where: {
          entity_id: id,
        },
      });

      if (!file) {
        this.logger.debug(`${identifierRequest} file not found`);
        throw new NotFoundException(
          setMessage(
            getMessage(MessagesHelperKey.USER_NOT_FOUND, languagePreference),
            id,
          ),
        );
      }
      console.log(file.s3_path);
      const bucketName = process.env.AWS_BUCKET_NAME;
      const signedUrl = await this.s3Service.getUrl(
        file.s3_path,
        bucketName,
        ResponseContentDisposition,
        ResponseContentType,
      );
      return signedUrl;
    } catch (error) {
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }
  /**
   * Maps an entity from one class to another asynchronously using a mapper.
   * @template TInput - The input entity class type.
   * @template TOutput - The output entity class type.
   * @param {TInput} user - The input entity object to be mapped.
   * @param {new () => TInput} inputClass - The class constructor for the input entity.
   * @returns {TOutput} - A promise that resolves to the mapped output entity.
   */
  mapperEntity<TInput, TOutput>(
    user: TInput | TInput[],
    inputClass: new () => TInput,
    outputClass: new () => TOutput,
    mapperArray: boolean,
  ): TOutput | TOutput[] {
    if (mapperArray) {
      return this.mapper.mapArray(user as TInput[], inputClass, outputClass);
    }

    return this.mapper.map(user as TInput, inputClass, outputClass);
  }
}
