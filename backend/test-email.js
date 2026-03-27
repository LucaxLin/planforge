import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env.dev') });

console.log('📧 Testing Email Configuration...');
console.log('='.repeat(60));

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
});

async function testEmail() {
  try {
    console.log('🔄 Connecting to SMTP server...');
    console.log(`   Host: ${process.env.SMTP_HOST}`);
    console.log(`   Port: ${process.env.SMTP_PORT}`);
    console.log(`   User: ${process.env.SMTP_USER}`);
    console.log('');

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.SMTP_USER,
      subject: 'PlanForge 邮件发送测试',
      text: '这是一封测试邮件，用于验证邮件配置是否正确。',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">PlanForge 邮件发送测试</h2>
          <p>这是一封测试邮件，用于验证邮件配置是否正确。</p>
          <p>如果收到此邮件，说明配置成功！</p>
        </div>
      `,
    });

    console.log('✅ 邮件发送成功！');
    console.log('='.repeat(60));
    console.log(`📬 Message ID: ${info.messageId}`);
    console.log(`📬 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    console.log('');
    console.log('💡 提示：您可以访问上面的 Preview URL 查看邮件内容');
  } catch (error) {
    console.error('❌ 邮件发送失败！');
    console.log('='.repeat(60));
    console.error('错误类型:', error.name);
    console.error('错误信息:', error.message);
    console.error('');
    console.log('💡 常见问题解决方案：');
    console.log('1. 检查 SMTP_USER 和 SMTP_PASS 是否正确');
    console.log('2. 确认邮箱已开启 SMTP 服务');
    console.log('3. 确认使用的是授权码而非登录密码');
    console.log('4. 检查网络连接');
    console.log('5. 查看 https://mail.qq.com 的 SMTP 设置');

    if (error.code === 'EAUTH') {
      console.log('');
      console.log('⚠️  认证失败 - 请检查：');
      console.log('   - 授权码是否正确（不是登录密码）');
      console.log('   - SMTP 服务是否已开启');
      console.log('   - 授权码是否过期');
    }
  }
}

testEmail();
