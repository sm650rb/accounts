import path from 'node:path';
import { EMAIL_LOGO_CID } from './email-templates';

export { EMAIL_LOGO_CID };

export function getEmailLogoAttachment() {
  return {
    filename: 'logo.png',
    path: path.join(process.cwd(), 'public/email/logo.png'),
    cid: EMAIL_LOGO_CID,
  };
}
