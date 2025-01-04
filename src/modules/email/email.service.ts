// filepath: /c:/Users/magazine/Desktop/www/projeto-estoque-validade/api/src/modules/email/email.service.ts
import {
  InternalServerErrorException,
  Injectable,
  Logger,
} from '@nestjs/common';
import axios from 'axios';
import { MessagesHelperKey, getMessage } from 'src/helpers/messages.helper';
import { Languages } from 'src/utils/language-preference';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  /**
   * Sends an email with the given markup content.
   *
   * @param {string} markup - The HTML content to be sent in the email.
   * @param {string} subject - The subject of the email.
   * @param {string} sendToEmail - The recipient's email address.
   *
   * @returns {Promise<void>} A promise that resolves when the email is sent successfully or throws an error otherwise.
   *
   * @description
   * Sends an email using Brevo with the specified HTML content, subject, and recipient email address.
   */
  async sendEmail(
    markup: string,
    subject: string,
    sendToEmail: string,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
      files?: {
        filename: string;
        contentType: string;
        cid: string;
        content: string;
      }[];
      attachments?: {
        content: string;
        filename: string;
        type: string;
        content_id: string;
        disposition: string;
      }[];
    },
  ): Promise<void> {
    try {
      const response = await axios.post(
        'https://api.sendinblue.com/v3/smtp/email',
        {
          sender: { email: process.env.BREVO_SENDER_EMAIL, name: 'Your Name' },
          to: [{ email: sendToEmail }],
          subject: subject,
          htmlContent: markup,
          // Adicione outros campos necessários aqui
        },
        {
          headers: {
            'api-key': process.env.BREVO_API_KEY,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status === 201) {
        this.logger.log(`Email sent to ${sendToEmail}`);
      } else {
        this.logger.error(
          `Failed to send email to ${sendToEmail} - Status: ${response.status}`,
        );
        throw new InternalServerErrorException(
          getMessage(MessagesHelperKey.FAIL_SENDING_EMAIL, languagePreference),
        );
      }
    } catch (error) {
      console.log(error);
      this.logger.error(`Failed to send email to ${sendToEmail}`, error);
      throw new InternalServerErrorException(
        getMessage(MessagesHelperKey.FAIL_SENDING_EMAIL, languagePreference),
      );
    }
  }
}
