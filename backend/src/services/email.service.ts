import nodemailer from 'nodemailer';

interface EmailSettings {
  emailSmtpHost: string;
  emailSmtpPort: number;
  emailSmtpUser: string;
  emailSmtpPass: string;
  emailFrom: string;
}

export async function sendEmail(to: string, subject: string, text: string, settings: EmailSettings) {
  const transporter = nodemailer.createTransport({
    host: settings.emailSmtpHost,
    port: settings.emailSmtpPort,
    secure: settings.emailSmtpPort === 465,
    auth: settings.emailSmtpUser ? {
      user: settings.emailSmtpUser,
      pass: settings.emailSmtpPass,
    } : undefined,
  });

  await transporter.sendMail({
    from: settings.emailFrom || 'stockroom@localhost',
    to,
    subject,
    text,
    html: `<div style="font-family:sans-serif;padding:20px;">
      <h2 style="color:#4F46E5;">Stock-Room</h2>
      <p>${text}</p>
      <hr style="margin-top:20px;border:none;border-top:1px solid #e5e7eb;" />
      <small style="color:#9ca3af;">Notifica automatica da Stock-Room</small>
    </div>`,
  });
}
