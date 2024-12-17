import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { envs } from 'src/config';

@Injectable()
export class MailerService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: envs.EMAIL,
        pass: envs.APP_EMAIL_PASSWORD,
      },
    });
  }

  async sendMail(to: string, subject: string, text: string) {
    const mailOptions = {
      from: envs.EMAIL,
      to,
      subject,
      text,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
