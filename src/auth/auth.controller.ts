import {
  Body,
  Controller,
  Get,
  Patch,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
  Request,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiNoContentResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AssignmentsEnum } from '@prisma/client';
import { Response } from 'express';
import { AuditLogRequestInformation } from 'src/middlewares/interface/logger';
import { AssignmentPermission } from 'src/utils/constants';
import { generatePassword } from 'src/utils/generate-password';
import { getIpAddress, getLanguage } from 'src/utils/get-ip-address';

import { AuthService } from './auth.service';
import { Assignments } from './decorators/assignments.decorator';
import { AuthenticatedUser } from './decorators/current-user.decorator';
import { IsPublic } from './decorators/is-public.decorator';
import { ChangePasswordByRecovery } from './dto/request/change-password-by-recovery.dto';
import { EmailDto } from './dto/request/email.dto';
import { LoginDto } from './dto/request/login.dto';
import { UserToken } from './dto/response/UserToken';
import { AtGuard, LocalAuthGuard, RtGuard } from './guards';
import { RequestModel } from './models/Request';
import { UserPayload } from './models/UserPayload';
import { RegisterDto } from './dto/request/register-user.dto';
import { UserCreateDto } from 'src/modules/user/dto/request/user.create.dto';
import { ApiExceptionResponse } from 'src/utils/swagger-schemas/SwaggerSchema';
import { verifyAccountCreateDtos } from 'src/modules/user/dto/request/verify.account.create.token.dto';
import { CodeCheckDto } from './dto/request/code-check.dto';
import { ModifyPasswordWithOldPasswordDto } from './dto/request/modify-password-with-old-password.dto';

@Controller('auth')
@ApiTags('Auth')
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
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Forgot Password' })
  @Post('forgot/password')
  @IsPublic()
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.CREATED)
  async forgotPassword(
    @Request() request: RequestModel,
    @Res() response: Response,
    @Body() dto: EmailDto,
  ) {
    await this.authService.sendRecoveryPasswordEmail(
      dto,
      new AuditLogRequestInformation(
        getIpAddress(request.headers['x-forwarded-for']),
        request.url,
        request.method,
      ),
      getLanguage(request.headers['accept-language']),
    );

    return response.status(HttpStatus.OK).send();
  }
  @ApiOperation({ summary: 'Register a new user' })
  @Post('register')
  @IsPublic()
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Request() request: RequestModel,
    @Res() response: Response,
    @Body() dto: UserCreateDto,
    @AuthenticatedUser() currentUser: UserPayload,
  ) {
    const returnUser = await this.authService.register(
      dto,
      currentUser,
      new AuditLogRequestInformation(
        getIpAddress(request.headers['x-forwarded-for']),
        request.url,
        request.method,
      ),
      getLanguage(request.headers['accept-language']),
    );

    return response.status(HttpStatus.OK).send(returnUser);
  }
  @ApiOperation({ summary: 'Verify create token user' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiExceptionResponse()
  @IsPublic()
  @Post('/verify-code')
  protected async verifyTokenUserAsync(
    @Res() response: Response,
    @Request() request: RequestModel,
    @Body() dto: verifyAccountCreateDtos,
  ) {
    const result = await this.authService.verifyCodeAccountCreate(
      dto.token,
      dto.email,
      getLanguage(request.headers['accept-language']),
    );
    return response.status(HttpStatus.OK).json(result);
  }
  @ApiOperation({ summary: 'Verify change password token user' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiExceptionResponse()
  @IsPublic()
  @Post('/verify-code/password')
  protected async verifyChangePasswordTokenUser(
    @Res() response: Response,
    @Request() request: RequestModel,
    @Body() dto: verifyAccountCreateDtos,
  ) {
    const result = await this.authService.checkCodeRecoveryPassword(
      dto.token,
      dto.email,
      new AuditLogRequestInformation(
        getIpAddress(request.headers['x-forwarded-for']),
        request.url,
        request.method,
      ),
      getLanguage(request.headers['accept-language']),
    );
    return response.status(HttpStatus.OK).json({ access_token: result });
  }
  @ApiOperation({ summary: 'Send Verify Code' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiExceptionResponse()
  @IsPublic()
  @Post('/code-check')
  protected async sendCode(
    @Res() response: Response,
    @Request() request: RequestModel,
    @Body() dto: CodeCheckDto,
  ) {
    await this.authService.codeCheck(
      dto,
      getLanguage(request.headers['accept-language']),
    );
    return response.status(HttpStatus.OK).json();
  }
  @ApiOperation({ summary: 'Change password by recovery' })
  @Patch('recovery/password')
  @IsPublic()
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  async changePasswordByRecovery(
    @Request() request: RequestModel,
    @Res() response: Response,
    @Body() dto: ChangePasswordByRecovery,
  ) {
    await this.authService.changePasswordByRecovery(
      dto,
      new AuditLogRequestInformation(
        getIpAddress(request.headers['x-forwarded-for']),
        request.url,
        request.method,
      ),
      getLanguage(request.headers['accept-language']),
    );

    return response.status(HttpStatus.OK).send();
  }

  @ApiOperation({ summary: 'Email Availability' })
  @Post('email/availability')
  @Assignments({
    assignments: [AssignmentsEnum.USER],
    permissions: [AssignmentPermission.CREATE, AssignmentPermission.UPDATE],
  })
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async checkEmailAvailability(
    @Body() dto: EmailDto,
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Request() request: RequestModel,
  ) {
    const checkEmail = await this.authService.checkEmailAvailability(
      dto,
      currentUser,
      getLanguage(request.headers['accept-language']),
    );

    return response.status(HttpStatus.OK).json({
      available: checkEmail,
    });
  }

  @ApiOperation({ summary: 'Resend registration email' })
  @Assignments({
    assignments: [AssignmentsEnum.USER],
    permissions: [AssignmentPermission.CREATE, AssignmentPermission.UPDATE],
  })
  @Post('resend')
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async resendActivationEmail(
    @Body() dto: EmailDto,
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Request() request: RequestModel,
  ) {
    await this.authService.sendRegistrationEmail(
      {
        userEmail: dto.email,
        generatedPassword: generatePassword(),
      },
      currentUser,
      new AuditLogRequestInformation(
        getIpAddress(request.headers['x-forwarded-for']),
        request.url,
        request.method,
      ),
      getLanguage(request.headers['accept-language']),
      {
        resend: true,
      },
    );

    return response.status(HttpStatus.OK).send();
  }

  @ApiOperation({ summary: 'Login' })
  @Post('login')
  @IsPublic()
  @UseGuards(LocalAuthGuard)
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UserToken,
  })
  async login(
    @Request() request: RequestModel,
    @Res() response: Response,
    @Body() dto: LoginDto,
  ) {
    const loginResponse = await this.authService.login(
      dto,
      new AuditLogRequestInformation(
        getIpAddress(request.headers['x-forwarded-for']),
        request.url,
        request.method,
      ),
      getLanguage(request.headers['accept-language']),
    );

    return response.status(HttpStatus.OK).json(loginResponse);
  }

  @ApiOperation({ summary: 'Logout' })
  @UseGuards(AtGuard)
  @Post('logout')
  @ApiNoContentResponse()
  @ApiBearerAuth()
  async logout(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Request() request: RequestModel,
  ) {
    await this.authService.logout(
      currentUser,
      new AuditLogRequestInformation(
        getIpAddress(request.headers['x-forwarded-for']),
        request.url,
        request.method,
      ),
      getLanguage(request.headers['accept-language']),
    );

    return response.status(HttpStatus.OK).send();
  }

  /**
   * Send the refresh token in header as Authorization
   */
  @ApiOperation({ summary: 'Refresh Token' })
  @Get('refresh')
  @IsPublic()
  @UseGuards(ThrottlerGuard)
  @UseGuards(RtGuard)
  @ApiResponse({ status: HttpStatus.OK, type: UserToken })
  @ApiBearerAuth()
  async refresh(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Request() request: RequestModel,
  ) {
    const refreshResponse = await this.authService.refreshToken(
      currentUser,
      new AuditLogRequestInformation(
        getIpAddress(request.headers['x-forwarded-for']),
        request.url,
        request.method,
      ),
      getLanguage(request.headers['accept-language']),
    );

    return response.status(HttpStatus.OK).json(refreshResponse);
  }
  /**
   * Send the refresh token in header as Authorization
   */
  @ApiOperation({ summary: 'Modify Password with old Password' })
  @Put('modify/password')
  @Assignments({
    assignments: [AssignmentsEnum.USER],
    permissions: [AssignmentPermission.CREATE, AssignmentPermission.UPDATE],
  })
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async ModifyWithOldPassword(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Request() request: RequestModel,
    @Body() dto: ModifyPasswordWithOldPasswordDto,
  ) {
    await this.authService.modifyPasswordWithOldPassword(
      currentUser,
      dto,
      new AuditLogRequestInformation(
        getIpAddress(request.headers['x-forwarded-for']),
        request.url,
        request.method,
      ),
      getLanguage(request.headers['accept-language']),
    );

    return response.status(HttpStatus.OK).json({
      message: 'Senha alterada com sucesso',
    });
  }

  @ApiOperation({ summary: 'Current user information' })
  @UseGuards(AtGuard)
  @ApiResponse({ status: HttpStatus.OK, type: UserPayload })
  @Get('me')
  @ApiBearerAuth()
  async getMe(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Request() request: RequestModel,
  ) {
    const usuarioDB = await this.authService.getMe(
      currentUser,
      getLanguage(request.headers['accept-language']),
    );
    console.log(usuarioDB);
    return response
      .status(HttpStatus.OK)
      .json({ ...usuarioDB, organizationId: currentUser.organizationId });
  }
}
