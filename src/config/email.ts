import { env } from './env';

export const emailConfig = {
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: env.EMAIL_SECURE,
    auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
    },
    from: env.DEFAULT_EMAIL_FROM,//ignore
}; 