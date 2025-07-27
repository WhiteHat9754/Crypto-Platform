import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<void> => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw new Error('Failed to send email');
  }
};

export const sendWelcomeEmail = async (email: string, firstName: string): Promise<void> => {
  const subject = 'Welcome to CryptoPlatform!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f59e0b;">Welcome to CryptoPlatform, ${firstName}!</h2>
      <p>Thank you for joining our crypto trading platform. Your account has been successfully created.</p>
      <p>You can now:</p>
      <ul>
        <li>Trade cryptocurrencies</li>
        <li>Manage your portfolio</li>
        <li>Access real-time market data</li>
      </ul>
      <p>Happy trading!</p>
      <p>Best regards,<br>The CryptoPlatform Team</p>
    </div>
  `;
  
  await sendEmail(email, subject, html);
};

export const sendPasswordResetEmail = async (
  email: string,
  firstName: string,
  resetToken: string
): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const subject = 'Password Reset Request';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f59e0b;">Password Reset Request</h2>
      <p>Hi ${firstName},</p>
      <p>You requested a password reset for your CryptoPlatform account.</p>
      <p>Click the button below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Reset Password</a>
      <p>This link will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>The CryptoPlatform Team</p>
    </div>
  `;
  
  await sendEmail(email, subject, html);
};
