#!/usr/bin/env node
/**
 * Send a themed verification email preview (no DB record required).
 * Usage (from acc/): npm run email:preview -- [email] [name...]
 * Or: node --experimental-strip-types scripts/send-email-preview.mjs [email] [name...]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import nodemailer from 'nodemailer';

const EMAIL_LOGO_CID = 'rb-logo@roadburners';
const accRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    let key = t.slice(0, eq).trim();
    let value = t.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    value = value.replace(/\\(.)/g, '$1');
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(path.join(accRoot, '.env.local'));
loadEnvFile(path.join(accRoot, '.env'));

const to = process.argv[2] ?? process.env.SMTP_USER ?? 'sm650rb@gmail.com';
const recipientName = process.argv.slice(3).join(' ').trim() || undefined;
const baseUrl = (process.env.APP_URL ?? 'http://localhost:5174').replace(/\/$/, '');

const { buildVerificationEmail } = await import(
  pathToFileURL(path.join(accRoot, 'lib/email-templates.ts')).href
);

const verifyUrl = `${baseUrl}/verify-email?token=preview-${Date.now()}`;
const { subject, text, html } = buildVerificationEmail({
  verifyUrl,
  recipientName,
});

const from = process.env.SMTP_FROM ?? 'Road Burners <sm650rb@gmail.com>';
const hasSmtp = Boolean(
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD,
);

console.log(`Preview verification email → ${to}`);
console.log(`Subject: ${subject}`);

if (!hasSmtp) {
  console.log('[email] SMTP not configured — logging plain text only:');
  console.log(text);
  process.exit(0);
}

const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const secure = process.env.SMTP_SECURE === '1' || port === 465;

await nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port,
  secure,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
}).sendMail({
  from,
  to,
  subject,
  text,
  html,
  attachments: [
    {
      filename: 'logo.png',
      path: path.join(accRoot, 'public/email/logo.png'),
      cid: EMAIL_LOGO_CID,
    },
  ],
});

console.log('Sent.');
