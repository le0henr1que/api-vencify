import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Request,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AssignmentsEnum } from '@prisma/client';
import { Response } from 'express';
import { Assignments } from 'src/auth/decorators/assignments.decorator';
import { AuthenticatedUser } from 'src/auth/decorators/current-user.decorator';
import { RequestModel } from 'src/auth/models/Request';
import { UserPayload } from 'src/auth/models/UserPayload';
import { DefaultFilter } from 'src/filters/DefaultFilter';
import { AssignmentPermission } from 'src/utils/constants';
import { getLanguage } from 'src/utils/get-ip-address';
import {
  ApiExceptionResponse,
  ApiOkResponsePaginated,
} from 'src/utils/swagger-schemas/SwaggerSchema';

import { DefaultFilterFile } from './dto/request/file.filter.dto';
import { FileParamsDto } from './dto/request/file.params.dto';
import { FilePaginationResponse } from './dto/response/file.pagination.response';
import { FileParamsResponseDto } from './dto/response/file.params.dto';
import { FileTypeMap } from './dto/type/file.type.map';
import { FileService } from './file.service';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';

@Controller('file')
@ApiTags('File')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-forwarded-for',
  required: false,
  description: 'O endereço IP original do cliente conectado',
  schema: { type: 'string' },
})
@ApiHeader({
  name: 'accept-language',
  required: false,
  description: 'Linguagem de preferência do usuário',
  schema: {
    type: 'string',
    enum: ['en-US', 'pt-BR'],
    default: 'pt',
  },
})
export class FileController {
  constructor(protected readonly service: FileService) {}

  @Post('/:entity_name/upload/:entity_id')
  @ApiOperation({ summary: 'Upload de arquivo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Arquivo para upload',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Assignments({
    assignments: [AssignmentsEnum.FILE],
    permissions: [AssignmentPermission.READ],
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param() entityName: FileParamsDto,
    @Res() response: Response,
    @Request() request: RequestModel,
    @AuthenticatedUser() currentUser: UserPayload,
  ) {
    const result = await this.service.uploadFile(
      file,
      entityName,
      currentUser,
      getLanguage(request.headers['accept-language']),
    );
    console.log(result);
    return response.status(HttpStatus.OK).json(result);
  }

  @ApiOperation({ summary: 'Get filtered Files' })
  @ApiOkResponsePaginated(FilePaginationResponse)
  @ApiExceptionResponse()
  @Assignments({
    assignments: [AssignmentsEnum.FILE],
    permissions: [AssignmentPermission.READ],
  })
  @Get('/:entity_name')
  async getFilteredAsync(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Query() filter: DefaultFilterFile<FileTypeMap>,
    @Request() request: RequestModel,
    @Param() entityName: FileParamsResponseDto,
  ) {
    const filteredData = await this.service.findFilteredAsync(
      entityName,
      filter,
      currentUser,
      getLanguage(request.headers['accept-language']),
    );

    return response.status(HttpStatus.OK).json(filteredData);
  }

  @ApiOperation({ summary: 'Assigned URL' })
  @ApiExceptionResponse()
  @Assignments({
    assignments: [AssignmentsEnum.FILE],
    permissions: [AssignmentPermission.READ],
  })
  @Post('/signed/:id')
  async getSignedUrl(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Query() filter: DefaultFilter<FileTypeMap>,
    @Request() request: RequestModel,
    @Param('id') id: string,
  ) {
    const filteredData = await this.service.getSignedUrl(
      id,
      request.headers['content-disposition'],
      request.headers['content-type'],
      filter,
      currentUser,
      getLanguage(request.headers['accept-language']),
    );

    return response.status(HttpStatus.OK).json({ url: filteredData });
  }

  @ApiOperation({ summary: 'Assigned URL' })
  @ApiExceptionResponse()
  @IsPublic()
  @Get('/avatar/:id')
  async getAvatar(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Query() filter: DefaultFilter<FileTypeMap>,
    @Request() request: RequestModel,
    @Param('id') id: string,
  ) {
    const filteredData = await this.service.returnFile(
      id,
      request.headers['content-disposition'],
      request.headers['content-type'],
      filter,
      currentUser,
      getLanguage(request.headers['accept-language']),
    );
    console.log(filteredData);
    return response.sendFile(filteredData);
  }
}
