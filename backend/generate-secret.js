import crypto from 'crypto';

const secret = crypto.randomBytes(64).toString('hex');

console.log('🔐 JWT Secret Key:');
console.log('='.repeat(60));
console.log(secret);
console.log('='.repeat(60));
console.log('\n📋 使用方法：');
console.log('将上面的密钥复制到 .env.prod 文件中的 JWT_SECRET');
console.log('\n⚠️  注意事项：');
console.log('1. 密钥长度：64 字节（128 个十六进制字符）');
console.log('2. 不要泄露给他人');
console.log('3. 生成后请妥善保存');
console.log('4. 如果密钥泄露，攻击者可以伪造任意用户的身份');
