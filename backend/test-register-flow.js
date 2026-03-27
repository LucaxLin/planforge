import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env.dev') });

const API_BASE = 'http://localhost:3001';

async function testRegisterFlow() {
  console.log('🧪 Testing Registration Flow');
  console.log('='.repeat(60));

  try {
    // Step 1: Get captcha
    console.log('📷 Step 1: Getting captcha...');
    const captchaRes = await fetch(`${API_BASE}/api/auth/captcha`);
    const captcha = await captchaRes.json();
    console.log('✅ Captcha ID:', captcha.captchaId);
    console.log('   Captcha data: (SVG image)');
    console.log('');

    // Step 2: Send register code
    console.log('✉️  Step 2: Sending registration code...');
    console.log('   Email: test@example.com');
    console.log('   Password: 123456');

    const sendCodeRes = await fetch(`${API_BASE}/api/auth/register/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: '123456',
        confirmPassword: '123456',
        captchaId: captcha.captchaId,
        captchaCode: 'test', // This will fail but we can see the response
      }),
    });

    const sendCodeData = await sendCodeRes.json();
    console.log('Response status:', sendCodeRes.status);
    console.log('Response:', JSON.stringify(sendCodeData, null, 2));
    console.log('');

    if (!sendCodeRes.ok) {
      console.log('❌ Failed to send code');
      console.log('   Error:', sendCodeData.error);
    } else {
      console.log('✅ Code sent successfully!');
      console.log('   Expires at:', new Date(sendCodeData.expiresAt));
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testRegisterFlow();
