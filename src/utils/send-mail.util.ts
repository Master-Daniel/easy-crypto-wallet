/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as ejs from 'ejs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: true, // Adjust as needed
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendMail(
    to: string,
    name: string,
    message: string,
    type: string,
    subject: string,
  ): Promise<boolean> {
    try {
      const templatePath = path.join(
        __dirname,
        '..',
        'email',
        'templates',
        `${type}.html`,
      );
      const template = await fs.promises.readFile(templatePath, 'utf8');

      const htmlContent = ejs.render(template, {
        name,
        app_url: this.configService.get<string>('FRONT_END_URL'),
        contact_email: this.configService.get<string>('CONTACT_EMAIL'),
        message,
      });

      const mailOptions: nodemailer.SendMailOptions = {
        from: `"Easy Crypto Wallet" <${this.configService.get<string>('MAIL_USER')}>`,
        to,
        subject,
        html: htmlContent,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent: ${info.response}`);
      return true;
    } catch (error) {
      this.logger.error('Error sending email:', error);
      return false;
    }
  }
}
