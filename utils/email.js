import nodemailer from 'nodemailer';
import Transport from 'nodemailer-brevo-transport'
import pug from 'pug';
import { convert } from 'html-to-text'
import { __dirname } from '../helpers/dirName.js'

export class Email {
  constructor(user, url) {
    this.to = user.email,
      [this.firstName,] = user.name.split(' ')
    this.url = url
    this.from = `Jonas <${process.env.EMAIL_FROM}>`
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {

      return nodemailer.createTransport({
        host: process.env.BREVO_HOST,
        port: process.env.BREVO_PORT,
        secure: false,
        auth: {
          user: process.env.BREVO_USERNAME,
          pass: process.env.BREVO_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  };

  async send(template, subject) {

    const html = pug.renderFile(`${__dirname}views/emails/${template}.pug`, {
      firsName: this.firstName,
      url: this.url,
      subject
    })


    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };

    await this.newTransport().sendMail(mailOptions)

  }
  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family !')
  }

  async sendPasswordReset() {
    await this.send('passwordReset', 'Your password reset toket (valid for only 10 minutes')
  }
}

