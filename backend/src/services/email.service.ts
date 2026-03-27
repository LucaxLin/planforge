import nodemailer from 'nodemailer';
import config from '../config/index.js';
import logger from '../utils/logger.js';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  }

  async sendVerificationCode(email: string, code: string): Promise<void> {
    const subject = 'PlanForge 注册验证码';

    const html = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>验证码</title>
      </head>
      <body style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px; text-align: center;">PlanForge 注册验证码</h2>

          <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            您好！感谢您注册 PlanForge。您的注册验证码为：
          </p>

          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; margin: 30px 0; border-radius: 8px;">
            <span style="color: white; font-size: 36px; font-weight: bold; letter-spacing: 12px; font-family: 'Courier New', monospace;">
              ${code}
            </span>
          </div>

          <p style="color: #999; font-size: 14px; line-height: 1.6; margin-bottom: 15px;">
            ⏰ 验证码将在 <strong>10 分钟</strong>内过期，请尽快完成验证。
          </p>

          <p style="color: #999; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            🔒 如果您没有发起此注册请求，请忽略此邮件，您的邮箱不会被注册。
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

          <p style="color: #999; font-size: 12px; text-align: center;">
            此邮件由系统自动发送，请勿回复。<br>
            © 2026 PlanForge - AI 驱动的需求分析平台
          </p>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: config.email.from,
        to: email,
        subject,
        html,
      });
      logger.info(`Verification code sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send email to ${email}:`, error);
      throw new Error('邮件发送失败');
    }
  }
}

export const emailService = new EmailService();
export default emailService;
