import svgCaptcha from 'svg-captcha';
import { v4 as uuidv4 } from 'uuid';
import { dbService } from './database.service.js';

class CaptchaService {
  generateCaptcha(): { captchaId: string; captchaData: string } {
    const captcha = svgCaptcha.create({
      size: 4,
      ignoreChars: '0o1iIl',
      noise: 3,
      color: false,
      background: '#f5f5f5',
      width: 120,
      height: 40,
      fontSize: 45,
    });

    const captchaId = uuidv4();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    dbService.createCaptcha(captchaId, captcha.text.toLowerCase(), expiresAt);

    const svgBuffer = Buffer.from(captcha.data);
    const base64Svg = svgBuffer.toString('base64');
    const dataUrl = `data:image/svg+xml;base64,${base64Svg}`;

    return {
      captchaId,
      captchaData: dataUrl,
    };
  }

  verifyCaptcha(captchaId: string, userInput: string): boolean {
    const captcha = dbService.getCaptcha(captchaId);

    if (!captcha) {
      return false;
    }

    if (captcha.expires_at < Date.now()) {
      dbService.deleteCaptcha(captchaId);
      return false;
    }

    if (captcha.code !== userInput.toLowerCase()) {
      return false;
    }

    dbService.deleteCaptcha(captchaId);
    return true;
  }
}

export const captchaService = new CaptchaService();
export default captchaService;
