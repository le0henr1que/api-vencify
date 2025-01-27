import { Injectable, Logger } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class AWSService {
  private logger = new Logger(AWSService.name);

  constructor() {}

  public region = process.env.AWS_BUCKET_REGION;
  public profile = process.env.AWS_PROFILE ?? 'default';
  /**
   * Configures the AWS API for file operations.
   *
   * @description
   * This method sets up the AWS configuration with the necessary region and credentials.
   * It uses AWS Cognito for identity management. If there's an error during configuration,
   * it logs the error message.
   */

  protected config(): void {
    try {
      AWS.config.update({
        region: this.region,
        credentials: new AWS.SharedIniFileCredentials({
          profile: this.profile,
        }),
      });
    } catch (err) {
      this.logger.error('Error in aws config ' + err);
    }
  }
}
