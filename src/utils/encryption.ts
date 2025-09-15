import crypto from 'crypto';
import { env } from '../config/env'; // Assuming your env config is exported from here

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = env.API_KEY_ENCRYPTION_SECRET;
const IV_LENGTH = 16;

if (!SECRET_KEY || SECRET_KEY.length !== 32) {
  throw new Error('API_KEY_ENCRYPTION_SECRET must be a 32-character string.');
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
} 