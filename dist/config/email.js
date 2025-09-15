"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailConfig = void 0;
const env_1 = require("./env");
exports.emailConfig = {
    host: env_1.env.EMAIL_HOST,
    port: env_1.env.EMAIL_PORT,
    secure: env_1.env.EMAIL_SECURE,
    auth: {
        user: env_1.env.EMAIL_USER,
        pass: env_1.env.EMAIL_PASS,
    },
    from: env_1.env.DEFAULT_EMAIL_FROM, //ignore
};
//# sourceMappingURL=email.js.map