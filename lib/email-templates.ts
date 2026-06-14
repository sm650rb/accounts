/** Content-ID for inline logo attachment (must match nodemailer attachment cid). */
export const EMAIL_LOGO_CID = 'rb-logo@roadburners';

const THEME = {
  gold: '#e8b923',
  goldDark: '#cfaa1e',
  dark: '#111111',
  darkWarm: '#2a2418',
  text: '#212529',
  muted: '#6c757d',
  bg: '#f4f5f7',
  white: '#ffffff',
  siteUrl: 'https://www.sm650.com',
} as const;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function greetingName(name?: string): string {
  const trimmed = name?.trim();
  return trimmed ? escapeHtml(trimmed.split(/\s+/)[0]!) : 'there';
}

function emailShell(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Road Burners</title>
</head>
<body style="margin:0;padding:0;background-color:${THEME.dark};font-family:Inter,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${THEME.dark};">
    <tr>
      <td align="center" style="padding:40px 16px;background:linear-gradient(145deg,${THEME.dark} 0%,${THEME.darkWarm} 50%,${THEME.dark} 100%);">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;background-color:${THEME.white};border-radius:12px;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,0.35);">
          ${content}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function emailHeader(): string {
  return `<tr>
    <td style="background-color:${THEME.dark};padding:22px 28px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="vertical-align:middle;padding-bottom:10px;">
            <img src="cid:${EMAIL_LOGO_CID}" width="190" height="38" alt="Road Burners SM650" style="display:block;border:0;height:38px;width:190px;max-width:100%;">
          </td>
        </tr>
        <tr>
          <td style="vertical-align:middle;">
            <p style="margin:2px 0 0 5px;font-size:12px;color:rgba(255,255,255,0.65);line-height:1.3;">Member Account</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function emailFooter(): string {
  return `<tr>
    <td style="padding:20px 28px 26px;border-top:1px solid #eeeeee;background-color:${THEME.bg};">
      <p style="margin:0;font-size:12px;line-height:1.6;color:${THEME.muted};text-align:center;">
        <a href="${THEME.siteUrl}" style="color:${THEME.goldDark};text-decoration:none;font-weight:600;">sm650.com</a>
        &nbsp;&middot;&nbsp; SM650 Community
      </p>
    </td>
  </tr>`;
}

function ctaButton(label: string, href: string): string {
  const safeHref = escapeHtml(href);
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0 8px;">
    <tr>
      <td align="center" style="border-radius:999px;background-color:${THEME.gold};">
        <a href="${safeHref}" target="_blank" style="display:inline-block;padding:14px 32px;font-family:Raleway,'Segoe UI',sans-serif;font-size:15px;font-weight:700;color:${THEME.dark};text-decoration:none;border-radius:999px;">${label}</a>
      </td>
    </tr>
  </table>`;
}

export function buildVerificationEmail(options: {
  verifyUrl: string;
  recipientName?: string;
}): { subject: string; text: string; html: string } {
  const { verifyUrl, recipientName } = options;
  const safeUrl = escapeHtml(verifyUrl);
  const firstName = greetingName(recipientName);

  const subject = 'Verify your Road Burners account';

  const text = [
    'Road Burners — Member Account',
    '',
    `Hi ${recipientName?.trim().split(/\s+/)[0] ?? 'there'},`,
    '',
    'Welcome to the Road Burners member portal. One last step: verify your email address to activate your account and sign in.',
    '',
    verifyUrl,
    '',
    'This link is for you only. If you did not register, you can ignore this email.',
    '',
    THEME.siteUrl,
  ].join('\n');

  const html = emailShell(`
    ${emailHeader()}
    <tr>
      <td style="padding:32px 28px 8px;">
        <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${THEME.goldDark};">Welcome aboard</p>
        <h1 style="margin:0 0 12px;font-family:Raleway,'Segoe UI',sans-serif;font-size:24px;font-weight:800;color:${THEME.text};line-height:1.25;">Verify your email</h1>
        <p style="margin:0;font-size:15px;line-height:1.65;color:${THEME.muted};">
          Hi ${firstName}, thanks for joining Road Burners. Tap the button below to confirm your email and unlock your member account.
        </p>
        ${ctaButton('Verify email address', verifyUrl)}
        <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:${THEME.muted};">
          Button not working? Copy and paste this link into your browser:
        </p>
        <p style="margin:8px 0 0;font-size:12px;line-height:1.5;word-break:break-all;">
          <a href="${safeUrl}" style="color:${THEME.goldDark};text-decoration:underline;">${safeUrl}</a>
        </p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:28px;">
          <tr>
            <td style="padding:14px 16px;background-color:${THEME.bg};border-radius:8px;border-left:4px solid ${THEME.gold};">
              <p style="margin:0;font-size:13px;line-height:1.55;color:${THEME.text};">
                After verification, sign in at the member portal with the email and password you chose during registration.
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#9ca3af;">
          If you did not create an account, you can safely ignore this email.
        </p>
      </td>
    </tr>
    ${emailFooter()}
  `);

  return { subject, text, html };
}
