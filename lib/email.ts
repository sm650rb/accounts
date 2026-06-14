import nodemailer from 'nodemailer';
import { appBaseUrl } from './app-url';
import { buildVerificationEmail } from './email-templates';
import { getEmailLogoAttachment } from './email-logo';

export { appBaseUrl };

function smtpFromAddress(): string {
  return process.env.SMTP_FROM ?? 'Road Burners <sm650rb@gmail.com>';
}

function hasSmtpConfig(): boolean {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD,
  );
}

function createTransport() {
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const secure = process.env.SMTP_SECURE === '1' || port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

async function sendMail(options: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  const { to, subject, text, html } = options;

  if (!hasSmtpConfig()) {
    console.log(`[email] To: ${to}`);
    console.log(`[email] From: ${smtpFromAddress()}`);
    console.log(`[email] Subject: ${subject}`);
    console.log(`[email] ${text}`);
    return;
  }

  const transport = createTransport();
  await transport.sendMail({
    from: smtpFromAddress(),
    to,
    subject,
    text,
    html,
    attachments: [getEmailLogoAttachment()],
  });
}

export async function sendVerificationEmail(
  to: string,
  verifyUrl: string,
  recipientName?: string,
): Promise<void> {
  const { subject, text, html } = buildVerificationEmail({ verifyUrl, recipientName });
  await sendMail({ to, subject, text, html });
}
