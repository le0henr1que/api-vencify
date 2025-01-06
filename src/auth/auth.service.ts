import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import {
  enumPlan,
  LogActionEnum,
  LogStatusEnum,
  MethodEnum,
  NotificationTimeEnum,
  Prisma,
  RoleEnum,
  StatusEnum,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { readFileSync } from 'fs';
import { Model } from 'mongoose';
import { join } from 'path';
import { PrismaService } from 'src/database/prisma/prisma.service';
import {
  MessagesHelperKey,
  getMessage,
  setMessage,
} from 'src/helpers/messages.helper';
import {
  AuditLog,
  AuditLogRequestInformation,
} from 'src/middlewares/interface/logger';
import { CrudType } from 'src/modules/base/interfaces/ICrudTypeMap';
import { EmailService } from 'src/modules/email/email.service';
import { LogService } from 'src/modules/log/log.service';
import { MongoService } from 'src/modules/mongo/mongo.service';
import {
  WebsocketMongo,
  WebsocketSchemaName,
} from 'src/modules/mongo/websocket.model';
import { UserCreateDto } from 'src/modules/user/dto/request/user.create.dto';
import { UserEntity } from 'src/modules/user/entity/user.entity';
import { UserTypeMap } from 'src/modules/user/entity/user.type.map';
import { UserRepository } from 'src/modules/user/user.repository';
import { UserService } from 'src/modules/user/user.service';
import {
  BLOCKED_BY_ADMIN,
  MAX_FAILED_LOGIN_ATTEMPTS,
} from 'src/utils/constants';
import { isDevelopmentEnviroment } from 'src/utils/environment';
import { generatePassword } from 'src/utils/generate-password';
import { guardUser } from 'src/utils/guards/guard-user';
import { hashData } from 'src/utils/hash';
import { Languages } from 'src/utils/language-preference';
import { recoverTemplateDataBind } from 'src/utils/templates/processors/recover-password-processor';
import { registrationTemplateDataBind } from 'src/utils/templates/processors/registration-processor';
import { handleError } from 'src/utils/treat.exceptions';

import { StripeService } from 'src/modules/stripe/stripe.service';
import { generateVerificationCode } from 'src/utils/handle-token-verification';
import { AuthRepository } from './auth.repository';
import { ChangePasswordByRecovery } from './dto/request/change-password-by-recovery.dto';
import { EmailDto } from './dto/request/email.dto';
import { LoginDto } from './dto/request/login.dto';
import { UserToken } from './dto/response/UserToken';
import { UserPayload } from './models/UserPayload';
import { RegisterDto } from './dto/request/register-user.dto';
import { CodeCheckDto } from './dto/request/code-check.dto';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly logService: LogService,
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private mongoService: MongoService,
    @InjectModel(WebsocketSchemaName)
    private readonly mongoModel: Model<WebsocketMongo>,
    // private readonly stipeService: StripeService,
  ) {}

  async validateIpRequest(
    token: string,
    request: AuditLogRequestInformation,
    languagePreference: Languages,
  ) {
    const identifierRequest = randomUUID();
    this.logger.log(`${identifierRequest} Validate IP Request`);

    const functionName = 'validateIpRequest';
    const decodedToken = this.jwtService.decode(token) as UserPayload;

    if (!decodedToken || !decodedToken.email || !decodedToken.id) {
      this.logger.debug(`${identifierRequest} Invalid token.`);
      throw new UnauthorizedException(
        getMessage(MessagesHelperKey.INVALID_TOKEN, languagePreference),
      );
    }

    const errorMessage = setMessage(
      getMessage(MessagesHelperKey.MULTIPLE_LOGIN_ERROR, languagePreference),
      decodedToken.email,
    );

    const websocketData: WebsocketMongo = await this.mongoService.findOne(
      { email: decodedToken.email },
      this.mongoModel,
    );

    // if (
    //   websocketData &&
    //   websocketData?.ip !== null &&
    //   websocketData?.ip !== request.ip
    // ) {
    //   await this.logService.createAuditLog(
    //     new AuditLog(
    //       functionName,
    //       request?.ip,
    //       request.url,
    //       MethodEnum[request.method],
    //       decodedToken.email,
    //       LogStatusEnum.ERROR,
    //       LogActionEnum.MULTIPLE_LOGIN,
    //       errorMessage,
    //     ),
    //     {
    //       identifierRequest,
    //     },
    //   );

    //   this.logger.debug(
    //     `${identifierRequest} Multiple login detected. IP to validate: Request: ${request?.ip} -> IP in database: ${websocketData?.ip}`,
    //   );

    //   throw new UnauthorizedException(
    //     getMessage(
    //       MessagesHelperKey.MULTIPLE_LOGIN_MESSAGE,
    //       languagePreference,
    //     ),
    //   );
    // }
  }

  async validateUser(
    email: string,
    password: string,
    request: AuditLogRequestInformation,
    languagePreference: Languages,
  ) {
    const identifierRequest = randomUUID();
    this.logger.debug(`${identifierRequest} Validate User`);

    const functionName = 'validateUser';
    try {
      return await this.prisma.$transaction(
        async (transaction: Prisma.TransactionClient) => {
          const user = await this.userService.findByEmail(
            email,
            languagePreference,
            {
              transaction,
              identifierRequest,
            },
          );

          if (!user) {
            this.logger.debug(
              `${identifierRequest} Error login! user ${email} not exists`,
            );
            throw new UnauthorizedException(
              getMessage(
                MessagesHelperKey.PASSWORD_OR_EMAIL_INVALID,
                languagePreference,
              ),
            );
          }

          if (user.blocked) {
            await this.logService.createAuditLog(
              new AuditLog(
                functionName,
                request.ip,
                request.url,
                MethodEnum[request.method],
                user.email,
                LogStatusEnum.ERROR,
                LogActionEnum.LOGIN,
                setMessage(
                  getMessage(
                    MessagesHelperKey.USER_BLOCKED_TRYING_ACCESS,
                    'pt-BR',
                  ),
                  user.email,
                ),
              ),
              {
                identifierRequest,
              },
            );

            // Blocked by admin
            if (user.loginAttempts == BLOCKED_BY_ADMIN) {
              this.logger.debug(
                `${identifierRequest} Error login! user blocked by admin`,
              );
              throw new ForbiddenException(
                getMessage(
                  MessagesHelperKey.USER_BLOCKED_BY_ADMIN_MESSAGE,
                  languagePreference,
                ),
              );
            } else {
              this.logger.debug(
                `${identifierRequest} Error login! user blocked by system`,
              );
              throw new ForbiddenException(
                getMessage(
                  MessagesHelperKey.USER_BLOCKED_MESSAGE,
                  languagePreference,
                ),
              );
            }
          }

          if (
            user.loginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS &&
            !user.blocked
          ) {
            await this.authRepository.blockUser(email);

            await this.logService.createAuditLog(
              new AuditLog(
                functionName,
                request.ip,
                request.url,
                MethodEnum[request.method],
                user.email,
                LogStatusEnum.SUCCESS,
                LogActionEnum.BLOCK,
                setMessage(
                  getMessage(MessagesHelperKey.USER_BLOCKED, 'pt-BR'),
                  user.email,
                ),
              ),
              {
                identifierRequest,
              },
            );

            this.logger.debug(
              `${identifierRequest} Error login! user blocked by login attempts`,
            );

            throw new ForbiddenException(
              getMessage(
                MessagesHelperKey.USER_BLOCKED_MESSAGE,
                languagePreference,
              ),
            );
          }

          this.logger.debug(`${identifierRequest} User ${email} found`);

          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (isPasswordValid) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
          } else {
            this.logger.debug(
              `${identifierRequest} Error login! password invalid`,
            );

            await this.authRepository.incrementLoginAttempts(
              email,
              transaction,
            );

            await this.logService.createAuditLog(
              new AuditLog(
                functionName,
                request.ip,
                request.url,
                MethodEnum[request.method],
                user.email,
                LogStatusEnum.ERROR,
                LogActionEnum.LOGIN,
                setMessage(
                  getMessage(MessagesHelperKey.LOGIN_ERROR, 'pt-BR'),
                  user.email,
                ),
              ),
              {
                identifierRequest,
                transaction,
              },
            );
          }
        },
      );
    } catch (error) {
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }

  async validateDisabledUserMiddleware(
    token: string,
    request: AuditLogRequestInformation,
    languagePreference: Languages,
  ) {
    const identifierRequest = randomUUID();

    const functionName = 'validateUnabledUserMiddleware';
    const decodedToken: UserPayload | any = this.jwtService.decode(token);

    if (!decodedToken) {
      this.logger.debug(`${identifierRequest} Invalid token.`);
      throw new UnauthorizedException(
        getMessage(MessagesHelperKey.TOKEN_INVALID, languagePreference),
        languagePreference,
      );
    }

    const user = await this.userService.findByEmail(
      decodedToken.email,
      languagePreference,
      {
        identifierRequest,
      },
    );
    console.log(user);

    if (user) {
      if (user.blocked) {
        await this.logService.createAuditLog(
          new AuditLog(
            functionName,
            request.ip,
            request.url,
            MethodEnum[request.method],
            user.email,
            LogStatusEnum.ERROR,
            LogActionEnum.DISABLED_USER,
            setMessage(
              getMessage(MessagesHelperKey.USER_BLOCKED_TRYING_ACCESS, 'pt-BR'),
              user.email,
            ),
          ),
          {
            identifierRequest,
          },
        );

        this.logger.debug(
          `${identifierRequest} Error login! user ${user.email} blocked by system`,
        );
        throw new ForbiddenException(
          getMessage(
            MessagesHelperKey.USER_BLOCKED_MESSAGE,
            languagePreference,
          ),
        );
      }

      if (user.status === StatusEnum.INACTIVE || user.deleted_at != null) {
        await this.logService.createAuditLog(
          new AuditLog(
            functionName,
            request.ip,
            request.url,
            MethodEnum[request.method],
            user.email,
            LogStatusEnum.ERROR,
            LogActionEnum.DISABLED_USER,
            setMessage(
              getMessage(
                MessagesHelperKey.USER_INACTIVE_TRYING_ACCESS,
                'pt-BR',
              ),
              user.email,
            ),
          ),
          {
            identifierRequest,
          },
        );

        this.logger.debug(
          `${identifierRequest} Error login! user ${user.email} inactivated`,
        );
        throw new ForbiddenException(
          setMessage(
            getMessage(
              MessagesHelperKey.USER_INACTIVE_TRYING_ACCESS,
              languagePreference,
            ),
            user.email,
          ),
        );
      }
    }
  }
  async verifyCodeAccountCreate(
    code: string,
    email: string,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ): Promise<{ id: string }> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    try {
      this.logger.log(`${identifierRequest} Verify code account create`);

      const result = await this.prisma.$transaction(
        async (transaction: Prisma.TransactionClient) => {
          const dataCode = await transaction.email_verifications.findFirst({
            where: { email: email, token: code },
          });
          if (dataCode == null) {
            this.logger.debug(`${identifierRequest} User not found`);
            throw new BadRequestException(
              setMessage(
                getMessage(
                  MessagesHelperKey.CODE_VERIFICATION_INVALID,
                  languagePreference,
                ),
                code,
              ),
            );
          }
          if (dataCode.token.toString() !== code.toString()) {
            this.logger.debug(
              `${identifierRequest} Code verification is invalid`,
            );
            throw new BadRequestException(
              setMessage(
                getMessage(
                  MessagesHelperKey.CODE_VERIFICATION_INVALID,
                  languagePreference,
                ),
                code,
              ),
            );
          }
          const tokenTimestamp = dataCode.updated_at || dataCode.created_at;
          const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

          if (tokenTimestamp < twelveHoursAgo) {
            this.logger.debug(
              `${identifierRequest} Code verification is expired`,
            );
            throw new BadRequestException(
              setMessage(
                getMessage(
                  MessagesHelperKey.CODE_VERIFICATION_EXPIRED,
                  languagePreference,
                ),
                code,
              ),
            );
          }
          const user = await transaction.user.upsert({
            where: { email: email },
            update: { isEmailVerified: true },
            create: {
              email: dataCode.email,
              isEmailVerified: true,
              name: dataCode.name,
              password: dataCode.password,
              emailVerificationToken: dataCode.token,
            },
          });
          await transaction.email_verifications.delete({
            where: { email: email },
          });
          const access_token = await this.jwtService.signAsync(
            {
              id: user.id,
              email: user.email,
              code: dataCode.token,
            },
            {
              secret: process.env.AT_SECRET_REGISTER,
              expiresIn: process.env.JWT_ACCESS_LIFETIME_REGISTER,
            },
          );

          return { id: user.id, access_token };
        },
      );
      console.log('DSADA', result);
      return result;
    } catch (error) {
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }
  async codeCheck(
    dto: CodeCheckDto,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ): Promise<any> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    try {
      return await this.prisma.$transaction(
        async (transaction: Prisma.TransactionClient) => {
          this.logger.log(`${identifierRequest} Code Check`);
          const isExist = await transaction.user.findFirst({
            where: { email: dto.email },
          });
          if (isExist) {
            this.logger.debug(`${identifierRequest} User already exists`);
            throw new ConflictException(
              setMessage(
                getMessage(
                  MessagesHelperKey.USER_ALREADY_REGISTERED,
                  languagePreference,
                ),
                dto.email,
              ),
            );
          }
          const userCode = await generateVerificationCode(4);
          const generatedPassword: string = generatePassword();
          const hash = await hashData(
            !dto?.password ? generatedPassword : dto.password,
          );

          await transaction.email_verifications.upsert({
            where: { email: dto.email },
            update: { token: userCode, updated_at: new Date() },
            create: {
              email: dto.email,
              name: dto.name,
              password: hash,
              token: userCode,
              created_at: new Date(),
            },
          });
          const templatePath = 'src/utils/templates/verification-code.html';
          const templateHtml = readFileSync(templatePath).toString();

          if (!templateHtml || templateHtml == '') {
            this.logger.debug(`${identifierRequest} Template not found`);
            throw new Error(
              'Não foi possível encontrar o template de registro de email',
            );
          }
          const templateBody = registrationTemplateDataBind(templateHtml, {
            name: dto.name,
            userCode,
          });
          console.log(userCode);
          const subject = 'Email de código de verificação';

          //TODO: croar logica para dev e prod
          await this.emailService.sendEmail(
            templateBody,
            subject,
            dto.email,
            languagePreference,
            {
              identifierRequest,
            },
          );
        },
      );
    } catch (error) {
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }
  async register(
    registerDto: UserCreateDto,
    currentUser: UserPayload,
    request: AuditLogRequestInformation,
    languagePreference: Languages,
  ): Promise<any> {
    const identifierRequest = randomUUID();
    const functionName = 'register';
    this.logger.log('POST IN Auth Service - register');

    try {
      return await this.prisma.$transaction(
        async (transaction: Prisma.TransactionClient) => {
          const {
            access_token,
            isNotification,
            notificationInterval,
            organization_name,
          } = registerDto;

          const validateToken = await this.jwtService.decode(access_token);
          console.log(validateToken);
          if (!validateToken) {
            throw new UnauthorizedException(
              setMessage(
                getMessage(MessagesHelperKey.ACCESS_DENIED, languagePreference),
                access_token,
              ),
            );
          }

          const isExist = await transaction.user.findFirst({
            where: { email: validateToken.email },
          });

          if (isExist?.emailVerificationToken !== validateToken?.code) {
            throw new UnauthorizedException(
              setMessage(
                getMessage(MessagesHelperKey.ACCESS_DENIED, languagePreference),
                access_token,
              ),
            );
          }

          const plan = await transaction.plan.upsert({
            where: { name: enumPlan.BASIC },
            update: {},
            create: {
              name: enumPlan.BASIC,
              price: 0,
              durationInDays: 30,
              userLimit: 1,
            },
          });

          const sub = await transaction.subscription.upsert({
            where: { user_id: isExist.id },
            update: {},
            create: {
              user_id: isExist.id,
              planId: plan.id,
              startDate: new Date(),
              endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
            },
          });

          const org = await transaction.organization.create({
            data: {
              name: organization_name,
              ownerId: isExist.id,
            },
          });

          const handleNotificationTime = (notificationInterval: string) => {
            const enums = {
              [NotificationTimeEnum.DAILY]: 1,
              [NotificationTimeEnum.WEEKLY]: 7,
              [NotificationTimeEnum.MONTHLY]: 30,
              [NotificationTimeEnum.HALF_MONTHLY]: 15,
              [NotificationTimeEnum.THIRTY_MONTHLY]: 30,
            };
            return enums[notificationInterval] || notificationInterval;
          };
          const notificationTimeEnum = Object.values(
            NotificationTimeEnum,
          ).includes(notificationInterval as NotificationTimeEnum)
            ? notificationInterval
            : NotificationTimeEnum.OTHER;
          const notificationTime = handleNotificationTime(notificationInterval);

          const user = await transaction.user.update({
            where: { id: isExist.id },
            data: {
              isEmailVerified: true,
              subscription_id: sub.id,
              notification_time: notificationTime,
              notification_time_enum:
                notificationTimeEnum as NotificationTimeEnum,
            },
          });

          const assignments = await transaction.assignment.findMany({});
          const role = await transaction.role.findFirst({
            where: { name: RoleEnum.ADMIN },
          });

          const OrgUser = await transaction.organizationUser.create({
            data: {
              organizationId: org.id,
              userId: user.id,
              ...(assignments && {
                UserAssignment: {
                  create: assignments.map((assignment) => ({
                    create: true,
                    read: true,
                    update: true,
                    delete: true,
                    organizationUserId: org.id,
                    Assignment: {
                      connect: {
                        id: assignment.id,
                      },
                    },
                  })),
                },
              }),
            },
          });
          const userRole = await transaction.userRole.create({
            data: {
              role: {
                connect: {
                  id: role.id,
                },
              },
              organizationUserId: OrgUser.organizationId,
            },
          });
          await transaction.organizationUser.update({
            where: {
              organizationId_userId: {
                organizationId: OrgUser.organizationId,
                userId: user.id,
              },
            },
            data: {
              Roles: {
                connect: {
                  id: userRole.id,
                },
              },
            },
          });
          const usuario = await this.userService.findByEmail(
            user.email,
            languagePreference,
            {
              transaction,
              identifierRequest,
            },
          );

          const tokens: UserToken = await this.getTokens(usuario, {
            identifierRequest,
          });

          return tokens;
        },
      );
    } catch (error) {
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }

  async updateRt(
    userId: string,
    refreshToken: string,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ) {
    const identifierRequest = optionals?.identifierRequest ?? randomUUID();
    this.logger.debug(`${identifierRequest} Service - updateRt`);

    const refreshTokenHash = await hashData(refreshToken);
    this.logger.debug(`${identifierRequest} refreshToken hashed ${userId}`);

    const user = await this.authRepository.updateRefreshToken(
      userId,
      refreshTokenHash,
      optionals?.transaction,
    );

    this.logger.debug(
      `${identifierRequest} Refresh token from ${user.email} updated`,
    );
  }

  async checkEmailAvailability(
    dto: EmailDto,
    currentUser: UserPayload,
    languagePreference: Languages,
  ): Promise<boolean> {
    const identifierRequest = randomUUID();
    this.logger.log(`${identifierRequest} checkEmail`);

    const alreadyExists = await this.userRepository.exists({
      email: dto.email,
      ...(dto.userBeingEditedId && { id: { not: dto.userBeingEditedId } }),
    });

    return alreadyExists == false;
  }

  async login(
    user: LoginDto,
    request: AuditLogRequestInformation,
    languagePreference: Languages,
  ) {
    const identifierRequest = randomUUID();
    const functionName = 'login';
    this.logger.log('POST in Auth Service - login');

    try {
      return await this.prisma.$transaction(
        async (transaction: Prisma.TransactionClient) => {
          const usuario = await this.userService.findByEmail(
            user.email,
            languagePreference,
            {
              transaction,
              identifierRequest,
            },
          );

          const tokens: UserToken = await this.getTokens(usuario, {
            identifierRequest,
          });

          this.logger.debug(
            `${identifierRequest} Tokens generated successfully`,
          );

          await this.updateRt(usuario.id, tokens.refreshToken, {
            identifierRequest,
            transaction,
          });

          if (usuario.status === StatusEnum.PENDING) {
            this.logger.debug(
              `${identifierRequest} User ${usuario.email} is pending, activating...`,
            );

            await this.authRepository.activeUser(usuario.id, transaction);
          }

          if (request?.ip) {
            await this.authRepository.updateIpUser(
              usuario.id,
              request?.ip,
              transaction,
            );

            this.logger.debug(
              `${identifierRequest} Updated ip ${request.ip} to user ${usuario.email}`,
            );
          }

          await this.logService.createAuditLog(
            new AuditLog(
              functionName,
              request.ip,
              request.url,
              MethodEnum[request.method],
              usuario.email,
              LogStatusEnum.SUCCESS,
              LogActionEnum.LOGIN,
              setMessage(
                getMessage(MessagesHelperKey.LOGIN_SUCCESS, 'pt-BR'),
                usuario.email,
              ),
            ),
            {
              identifierRequest,
              transaction,
            },
          );

          this.logger.debug(
            `${identifierRequest} User ${usuario.email} logged in successfully`,
          );

          return tokens;
        },
      );
    } catch (error) {
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }

  async logout(
    currentUser: UserPayload,
    request: AuditLogRequestInformation,
    languagePreference: Languages,
  ) {
    const identifierRequest = randomUUID();
    const functionName = 'logout';
    const userId = currentUser.id;

    this.logger.log(`${identifierRequest} POST in Auth Service - logout`);

    try {
      return await this.prisma.$transaction(
        async (transaction: Prisma.TransactionClient) => {
          this.logger.debug(
            `${identifierRequest} Removing refreshToken from user ${userId} in the database`,
          );

          const user = await this.authRepository.logoutUser(
            userId,
            transaction,
          );

          await this.logService.createAuditLog(
            new AuditLog(
              functionName,
              request.ip,
              request.url,
              MethodEnum[request.method],
              user.email,
              LogStatusEnum.SUCCESS,
              LogActionEnum.LOGOUT,
              setMessage(
                getMessage(MessagesHelperKey.USER_LOGGED_OUT, 'pt-BR'),
                user.email,
              ),
            ),
            {
              identifierRequest,
              transaction,
            },
          );
        },
      );
    } catch (error) {
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }

  async refreshToken(
    currentUser: UserPayload,
    request: AuditLogRequestInformation,
    languagePreference: Languages,
  ) {
    const identifierRequest = randomUUID();
    const functionName = 'refreshToken';
    const refreshToken = currentUser.refreshToken;

    this.logger.log(`${identifierRequest} Refresh Token`);

    try {
      return await this.prisma.$transaction(
        async (transaction: Prisma.TransactionClient) => {
          const userDb = (await this.userService.findByIdAsync(
            currentUser.id,
            currentUser,
            languagePreference,
            { transaction, identifierRequest },
          )) as UserEntity;

          if (!userDb || !userDb.refreshToken) {
            this.logger.error(
              `${identifierRequest} User with id ${currentUser.id} not found or not have a refreshToken`,
            );

            await this.logService.createAuditLog(
              new AuditLog(
                functionName,
                request.ip,
                request.url,
                MethodEnum[request.method],
                currentUser.email,
                LogStatusEnum.ERROR,
                LogActionEnum.REFRESH_TOKEN,
                setMessage(
                  getMessage(MessagesHelperKey.REFRESH_TOKEN_ERROR, 'pt-BR'),
                  currentUser.email,
                ),
              ),
            ),
              {
                identifierRequest,
              };
            throw new ForbiddenException(
              getMessage(MessagesHelperKey.ACCESS_DENIED, languagePreference),
            );
          }

          this.logger.debug(
            `${identifierRequest} User ${userDb.email} with ID ${userDb.id} found`,
          );

          const rtMatches = await bcrypt.compare(
            refreshToken,
            userDb?.refreshToken,
          );

          if (!rtMatches) {
            this.logger.debug(
              `${identifierRequest} refreshToken from user ${userDb.email} doesn't match`,
            );

            await this.logService.createAuditLog(
              new AuditLog(
                functionName,
                request.ip,
                request.url,
                MethodEnum[request.method],
                userDb.email,
                LogStatusEnum.ERROR,
                LogActionEnum.REFRESH_TOKEN,
                setMessage(
                  getMessage(MessagesHelperKey.REFRESH_TOKEN_ERROR, 'pt-BR'),
                  userDb.email,
                ),
              ),
              {
                identifierRequest,
              },
            );

            throw new ForbiddenException(
              getMessage(MessagesHelperKey.ACCESS_DENIED, languagePreference),
            );
          }

          this.logger.debug(
            `${identifierRequest} refreshToken from user ${userDb.email} matches. Generating new accessToken and refreshToken`,
          );

          const tokens = await this.getTokens(userDb);

          this.logger.debug(
            `${identifierRequest} Tokens generated successfully. Updating refreshToken in the user's database`,
          );

          await this.updateRt(userDb.id, tokens.refreshToken, {
            transaction,
            identifierRequest,
          });

          this.logger.debug(
            `${identifierRequest} refreshToken updated successfully in the user's database. Returning tokens and exiting the service "refresh"`,
          );

          await this.logService.createAuditLog(
            new AuditLog(
              functionName,
              request.ip,
              request.url,
              MethodEnum[request.method],
              userDb.email,
              LogStatusEnum.SUCCESS,
              LogActionEnum.REFRESH_TOKEN,
              setMessage(
                getMessage(MessagesHelperKey.REFRESH_TOKEN, 'pt-BR'),
                userDb.email,
              ),
            ),
            {
              identifierRequest,
            },
          );

          return tokens;
        },
      );
    } catch (error) {
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }
  async checkCodeRecoveryPassword(
    code: string,
    email: string,
    request: AuditLogRequestInformation,
    languagePreference: Languages,
  ) {
    const identifierRequest = randomUUID();
    const functionName = 'checkCode';

    const user = await this.userService.findByEmail(email, languagePreference, {
      identifierRequest,
    });
    try {
      if (!user) {
        this.logger.debug(
          `${identifierRequest} Error login! user ${email} not exists`,
        );
        throw new UnauthorizedException(
          getMessage(
            MessagesHelperKey.PASSWORD_OR_EMAIL_INVALID,
            languagePreference,
          ),
        );
      }

      if (user.recoveryToken == null) {
        this.logger.debug(
          `${identifierRequest} Error login! user ${email} not have a recoveryToken`,
        );
        throw new UnauthorizedException(
          getMessage(
            MessagesHelperKey.PASSWORD_OR_EMAIL_INVALID,
            languagePreference,
          ),
        );
      }

      const rtMatches = await bcrypt.compare(code, user.recoveryToken);

      if (!rtMatches) {
        this.logger.debug(
          `${identifierRequest} Code recovery from user ${email} doesn't match`,
        );

        throw new ForbiddenException(
          getMessage(MessagesHelperKey.ACCESS_DENIED, languagePreference),
        );
      }
      const access_token = await this.jwtService.signAsync(
        {
          id: user.id,
          email: user.email,
          code,
        },
        {
          secret: process.env.AT_SECRET_REFRESH_PASSWORD,
          expiresIn: process.env.JWT_ACCESS_LIFETIME_REFRESH_PASSWORD,
        },
      );
      this.logger.debug(
        `${identifierRequest} Code recovery from user ${email} matches`,
      );
      return access_token;
    } catch (error) {
      this.logger.debug('Recovery password email was not sent');

      await this.logService.createAuditLog(
        new AuditLog(
          functionName,
          request.ip,
          request.url,
          MethodEnum[request.method],
          user.email,
          LogStatusEnum.ERROR,
          LogActionEnum.SEND_EMAIL_RECOVERY_PASSWORD,
          setMessage(
            getMessage(MessagesHelperKey.FAIL_SENDING_EMAIL, 'pt-BR'),
            user.email,
          ),
        ),
        {
          identifierRequest,
        },
      );

      handleError(error, languagePreference, {
        message: getMessage(
          MessagesHelperKey.FAIL_SENDING_EMAIL,
          languagePreference,
        ),
        identifierRequest,
      });
    }
  }

  async sendRecoveryPasswordEmail(
    dto: EmailDto,
    request: AuditLogRequestInformation,
    languagePreference: Languages,
  ) {
    const identifierRequest = randomUUID();
    const functionName = 'sendRecoveryPasswordEmail';

    const userDb = await this.userService.findByEmail(
      dto.email,
      languagePreference,
      {
        identifierRequest,
      },
    );

    if (
      !userDb ||
      userDb.blocked ||
      userDb.status === StatusEnum.INACTIVE ||
      userDb.deleted_at != null
    ) {
      this.logger.warn(
        `Usuário ${dto.email} não está apto a receber o email de recuperação`,
      );

      return;
    }

    try {
      await this.prisma.$transaction(
        async (transaction: Prisma.TransactionClient) => {
          const userCode = await generateVerificationCode(4);

          const templatePath = 'src/utils/templates/verification-code.html';
          const templateHtml = readFileSync(templatePath).toString();

          if (!templateHtml || templateHtml == '') {
            this.logger.debug(`${identifierRequest} Template not found`);
            throw new Error(
              'Não foi possível encontrar o template de registro de email',
            );
          }
          const templateBody = registrationTemplateDataBind(templateHtml, {
            name: userDb.name,
            userCode,
          });
          console.log(userCode);
          const subject = 'Redefinição de senha';

          await this.emailService.sendEmail(
            templateBody,
            subject,
            dto.email,
            languagePreference,
            {
              identifierRequest,
            },
          );
          const tokenEncrypted = await hashData(userCode);

          await this.userRepository.updateAsync(
            userDb.id,
            {
              recoveryToken: tokenEncrypted,
              version: userDb.version,
            },
            transaction,
          );

          await this.logService.createAuditLog(
            new AuditLog(
              functionName,
              request.ip,
              request.url,
              MethodEnum[request.method],
              userDb.email,
              LogStatusEnum.SUCCESS,
              LogActionEnum.SEND_EMAIL_RECOVERY_PASSWORD,
              setMessage(
                getMessage(MessagesHelperKey.SUCCESS_SENDING_EMAIL, 'pt-BR'),
                userDb.email,
              ),
            ),
            {
              identifierRequest,
              transaction,
            },
          );

          this.logger.debug('Recovery password email was sent');
        },
      );
    } catch (error) {
      this.logger.debug('Recovery password email was not sent');

      await this.logService.createAuditLog(
        new AuditLog(
          functionName,
          request.ip,
          request.url,
          MethodEnum[request.method],
          userDb.email,
          LogStatusEnum.ERROR,
          LogActionEnum.SEND_EMAIL_RECOVERY_PASSWORD,
          setMessage(
            getMessage(MessagesHelperKey.FAIL_SENDING_EMAIL, 'pt-BR'),
            userDb.email,
          ),
        ),
        {
          identifierRequest,
        },
      );

      handleError(error, languagePreference, {
        message: getMessage(
          MessagesHelperKey.FAIL_SENDING_EMAIL,
          languagePreference,
        ),
        identifierRequest,
      });
    }
  }
  async registerUser(
    dto: RegisterDto,
    request: AuditLogRequestInformation,
    languagePreference: Languages,
  ) {
    const identifierRequest = randomUUID();
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          email: dto.email,
        },
      });
      if (user) {
        throw new BadRequestException('Email already exists');
      }
    } catch (error) {
      this.logger.debug('Recovery password email was not sent');

      handleError(error, languagePreference, {
        message: getMessage(
          MessagesHelperKey.FAIL_SENDING_EMAIL,
          languagePreference,
        ),
        identifierRequest,
      });
    }
  }

  async changePasswordByRecovery(
    dto: ChangePasswordByRecovery,
    request: AuditLogRequestInformation,
    languagePreference: Languages,
  ) {
    this.logger.log('POST in Auth Service - changePasswordByRecovery');

    const identifierRequest = randomUUID();

    // Public end point
    const currentUser = null;

    try {
      const userDataByToken = await this.jwtService.decode(dto.accessToken);

      const user = (await this.userService.findBy(
        {
          email: userDataByToken.email,
        },
        {
          id: true,
          email: true,
          recoveryToken: true,
          blocked: true,
          status: true,
          deleted_at: true,
        },
        currentUser,
        languagePreference,
        {
          identifierRequest,
        },
      )) as {
        id: string;
        email: string;
        recoveryToken: string;
        blocked: boolean;
        status: StatusEnum;
        deletedAt: Date | null;
      };

      if (!user) {
        this.logger.debug(
          `${identifierRequest} User with email ${userDataByToken.email} not found`,
        );

        throw new UnauthorizedException(
          setMessage(
            getMessage(MessagesHelperKey.USER_NOT_FOUND, languagePreference),
            userDataByToken.sub,
          ),
        );
      }

      guardUser(
        {
          blocked: user?.blocked,
          deletedAt: user?.deletedAt,
          email: user?.email,
          status: user?.status,
        },
        this.logger,
        languagePreference,
        {
          identifierRequest,
          requestUserEmail: user.email,
        },
      );

      let recoveryTokenIsValid = false;

      if (user?.recoveryToken) {
        recoveryTokenIsValid = await bcrypt.compare(
          userDataByToken.code,
          user.recoveryToken,
        );
      }

      if (!recoveryTokenIsValid) {
        this.logger.debug(
          `${identifierRequest} Token is invalid. User ${userDataByToken.sub} already changed his password`,
        );

        throw new UnauthorizedException(
          setMessage(
            getMessage(
              MessagesHelperKey.RECOVERY_PASSWORD_TOKEN_USED,
              languagePreference,
            ),
            userDataByToken.sub,
          ),
        );
      }

      await this.prisma.$transaction(
        async (transaction: Prisma.TransactionClient) => {
          const hash = await hashData(dto.newPassword);

          await this.userRepository.updateUserPassword(
            user.id,
            hash,
            transaction,
          );

          await this.logService.createAuditLog(
            new AuditLog(
              'changePasswordByRecovery',
              request.ip,
              request.url,
              MethodEnum[request.method],
              user.email,
              LogStatusEnum.SUCCESS,
              LogActionEnum.CHANGE_PASSWORD,
              setMessage(
                getMessage(MessagesHelperKey.PASSWORD_CHANGED, 'pt-BR'),
                user.email,
              ),
            ),
            {
              identifierRequest,
              transaction,
            },
          );

          this.logger.debug(
            `${identifierRequest} Password from user ${user.email} changed successfully`,
          );
        },
      );
    } catch (error) {
      await this.logService.createAuditLog(
        new AuditLog(
          'changePasswordByRecovery',
          request.ip,
          request.url,
          MethodEnum[request.method],
          'unknown',
          LogStatusEnum.ERROR,
          LogActionEnum.CHANGE_PASSWORD,
          setMessage(
            getMessage(MessagesHelperKey.PASSWORD_CHANGED_ERROR, 'pt-BR'),
            'unknown',
          ),
        ),
        {
          identifierRequest,
        },
      );

      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }

  async decodeEmailToken(
    accessToken: string,
    languagePreference: Languages,
    { identifierRequest },
  ) {
    this.logger.debug(`${identifierRequest} Service - decodeEmailToken`);

    let decodedToken: {
      sub: string;
      id: string;
      iat: number;
      exp: number;
    } | null;

    try {
      decodedToken = this.jwtService.verify(accessToken, {
        secret: process.env.TK_EMAIL_SECRET,
      });
    } catch (error) {
      this.logger.debug(`${identifierRequest} Invalid token.`);
      throw new UnauthorizedException(
        getMessage(MessagesHelperKey.INVALID_TOKEN, languagePreference),
      );
    }

    return decodedToken;
  }

  async sendRegistrationEmail(
    data: {
      userEmail: string;
      generatedPassword: string;
    },
    currentUser: UserPayload,
    request: AuditLogRequestInformation,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
      resend?: boolean;
    },
  ) {
    const identifierRequest = optionals?.identifierRequest ?? randomUUID();
    const functionName = 'sendRegistrationEmail';
    const { userEmail, generatedPassword } = data;

    try {
      this.logger.log(
        `${identifierRequest} ${
          optionals?.resend ? 'Resending' : 'Sending'
        } registration password email to: ${userEmail} `,
      );

      await this.guardResendEmail(
        optionals?.resend,
        userEmail,
        languagePreference,
        {
          identifierRequest,
          transaction: optionals?.transaction,
        },
      );

      if (isDevelopmentEnviroment()) {
        this.logger.debug(
          `${identifierRequest} [DEV] Password: ${generatedPassword}`,
        );
      }

      const userInDb = await this.userService.findByEmail(
        userEmail,
        languagePreference,
        {
          transaction: optionals?.transaction,
          identifierRequest,
        },
      );

      guardUser(
        {
          blocked: userInDb?.blocked,
          deletedAt: userInDb?.deleted_at,
          email: userInDb?.email,
          status: userInDb?.status,
        },
        this.logger,
        languagePreference,
        {
          identifierRequest,
          requestUserEmail: userEmail,
        },
      );

      let templatePath = '';

      const rootDir = process.cwd();
      templatePath = join(rootDir, 'src/utils/templates/registration.html');
      const templateHtml = readFileSync(templatePath).toString();

      if (!templateHtml || templateHtml == '') {
        this.logger.debug(`${identifierRequest} Template not found`);
        throw new Error(
          'Não foi possível encontrar o template de registro de email',
        );
      }

      const projectName = process.env.npm_package_name;

      const link = process.env.FRONT_END_URL;

      const templateBody = registrationTemplateDataBind(templateHtml, {
        name: userInDb.name,
        projectName,
        password: generatedPassword,
        link,
      });

      const subject = 'Email de confirmação de registro';

      await this.emailService.sendEmail(
        templateBody,
        subject,
        userEmail,
        languagePreference,
        {
          identifierRequest,
        },
      );

      await this.logService.createAuditLog(
        new AuditLog(
          functionName,
          request.ip,
          request.url,
          MethodEnum[request.method],
          currentUser.email,
          LogStatusEnum.SUCCESS,
          optionals?.resend
            ? LogActionEnum.RESEND_EMAIL
            : LogActionEnum.FIRST_ACCESS,
          setMessage(
            getMessage(MessagesHelperKey.SUCCESS_SENDING_EMAIL, 'pt-BR'),
            userEmail,
          ),
        ),
        {
          identifierRequest,
          transaction: optionals?.transaction,
        },
      );

      this.logger.debug(
        `${identifierRequest} ${
          optionals?.resend ? 'Resend' : 'Registration'
        } password email was sent`,
      );
    } catch (error) {
      this.logger.debug(
        `${identifierRequest} ${
          optionals?.resend ? 'Resend' : 'Registration'
        } password email was not sent ${error}`,
      );

      await this.logService.createAuditLog(
        new AuditLog(
          functionName,
          request.ip,
          request.url,
          MethodEnum[request.method],
          currentUser.email,
          LogStatusEnum.ERROR,
          optionals?.resend
            ? LogActionEnum.RESEND_EMAIL
            : LogActionEnum.FIRST_ACCESS,
          setMessage(
            getMessage(MessagesHelperKey.SUCCESS_SENDING_EMAIL, 'pt-BR'),
            userEmail,
          ),
        ),
        {
          identifierRequest,
        },
      );

      handleError(error, languagePreference, {
        message: getMessage(
          MessagesHelperKey.FAIL_SENDING_EMAIL,
          languagePreference,
        ),
        identifierRequest,
      });
    }
  }

  async guardResendEmail(
    resend: boolean,
    userEmail: string,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ) {
    const identifierRequest = optionals?.identifierRequest ?? randomUUID();

    const user: any = await this.userService.findByEmail(
      userEmail,
      languagePreference,
      {
        transaction: optionals?.transaction,
        identifierRequest,
      },
    );

    guardUser(
      {
        blocked: user?.blocked,
        deletedAt: user?.deletedAt,
        email: user?.email,
        status: user?.status,
      },
      this.logger,
      languagePreference,
      {
        identifierRequest,
        requestUserEmail: userEmail,
      },
    );

    if (resend && user.status === StatusEnum.ACTIVE) {
      this.logger.debug(
        `${identifierRequest} User already activated. Resend email not allowed`,
      );

      throw new BadRequestException(
        getMessage(MessagesHelperKey.USER_ALREADY_ACTIVED, languagePreference),
      );
    }
  }

  async getTokens(
    user: any,
    optionals?: {
      identifierRequest?: string;
    },
  ) {
    const identifierRequest = optionals?.identifierRequest ?? randomUUID();
    console.log('2', user);
    this.logger.debug(`${identifierRequest} Service - getTokens`);
    console.log('3', user);
    const {
      password,
      organizationUser,
      ownedOrganizations,
      ...userWithoutPassword
    } = user;

    const orgOwnerId = ownedOrganizations.find(
      (org) => user.id === org.ownerId,
    )?.id;
    const { Roles, UserAssignment } = organizationUser.find(
      (org) => org.id !== orgOwnerId,
    );
    console.log('3', Roles, UserAssignment);
    const payload = {
      sub: user.id,
      organizationId: orgOwnerId ?? organizationUser[0]?.id,
      roles: Roles.map((role) => role.role.name),
      assignments: UserAssignment.map((userAssignment) => {
        return {
          assignment: userAssignment?.Assignment?.name,
          create: userAssignment?.create,
          read: userAssignment?.read,
          update: userAssignment?.update,
          delete: userAssignment?.delete,
        };
      }),
      ...userWithoutPassword,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.AT_SECRET,
        expiresIn: process.env.JWT_ACCESS_LIFETIME,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.RT_SECRET,
        expiresIn: process.env.JWT_REFRESH_LIFETIME,
      }),
    ]);

    this.logger.debug(
      `${identifierRequest} Tokens generated successfully. Returning tokens and exiting the service "getTokens"`,
    );

    return {
      accessToken: at,
      refreshToken: rt,
    };
  }

  async getMe(currentUser: UserPayload, languagePreference: Languages) {
    this.logger.debug(`Getting me ${currentUser.email}`);

    const identifierRequest = randomUUID();
    const userDb = (await this.userService.findByIdAsync(
      currentUser.id,
      currentUser,
      languagePreference,
      { identifierRequest },
    )) as UserEntity;

    const { password, organizationUser, ...userWithoutPassword } = userDb;

    return {
      sub: currentUser.id,
      ...userWithoutPassword,
    };
  }
}
