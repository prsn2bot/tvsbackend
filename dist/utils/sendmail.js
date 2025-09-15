"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendCustomEmail = exports.sendInvoiceEmail = exports.sendPasswordResetEmail = exports.sendWelcomeEmail = exports.sendNotificationEmail = exports.sendUpdateEmail = exports.sendOtpEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const email_1 = require("../config/email");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const env_1 = require("../config/env");
const logger_1 = __importDefault(require("./logger"));
const websiteUrl = env_1.env.WEBSITE;
const companyMail = env_1.env.COMPANY_MAIL;
const transporter = nodemailer_1.default.createTransport({
    host: email_1.emailConfig.host,
    port: email_1.emailConfig.port,
    secure: email_1.emailConfig.secure,
    auth: {
        user: email_1.emailConfig.auth.user,
        pass: email_1.emailConfig.auth.pass,
    },
    tls: {
        rejectUnauthorized: false,
    },
});
const sendEmail = async (options) => {
    try {
        const mailOptions = {
            from: email_1.emailConfig.auth.user,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        };
        const info = await transporter.sendMail(mailOptions);
        logger_1.default.debug("Email sent: %s", info.messageId);
        return info;
    }
    catch (error) {
        logger_1.default.error("Error sending email:", error);
        throw error;
    }
};
exports.sendEmail = sendEmail;
const readEmailTemplate = (templateName, replacements) => {
    const templatePath = path.join(__dirname, "../templates", templateName);
    let htmlContent = fs.readFileSync(templatePath, "utf8");
    for (const key in replacements) {
        htmlContent = htmlContent.replace(new RegExp(`{{${key}}}`, "g"), replacements[key]);
    }
    return htmlContent;
};
const sendOtpEmail = async (toEmail, otpCode, validityDuration) => {
    const htmlContent = readEmailTemplate("otp-email.html", {
        otpCode,
        validityDuration,
        websiteUrl,
        companyMail,
    });
    await (0, exports.sendEmail)({
        to: toEmail,
        subject: "Your One-Time Password (OTP)",
        html: htmlContent,
    });
};
exports.sendOtpEmail = sendOtpEmail;
const sendUpdateEmail = async (toEmail, userName, updateDetails, actionLink) => {
    const htmlContent = readEmailTemplate("update-email.html", {
        userName,
        updateDetails,
        actionLink: actionLink || "#",
    });
    await (0, exports.sendEmail)({
        to: toEmail,
        subject: "Account Update Notification",
        html: htmlContent,
    });
};
exports.sendUpdateEmail = sendUpdateEmail;
const sendNotificationEmail = async (toEmail, userName, notificationSubject, notificationBody, actionLink, actionText) => {
    const htmlContent = readEmailTemplate("notification-email.html", {
        userName,
        notificationSubject,
        notificationBody,
        actionLink: actionLink || "",
        actionText: actionText || "",
    });
    await (0, exports.sendEmail)({
        to: toEmail,
        subject: notificationSubject,
        html: htmlContent,
    });
};
exports.sendNotificationEmail = sendNotificationEmail;
const sendWelcomeEmail = async (toEmail, userName, actionLink) => {
    const htmlContent = readEmailTemplate("welcome-email.html", {
        userName,
        actionLink: actionLink || "#",
    });
    await (0, exports.sendEmail)({
        to: toEmail,
        subject: "Welcome to Our Service!",
        html: htmlContent,
    });
};
exports.sendWelcomeEmail = sendWelcomeEmail;
const sendPasswordResetEmail = async (toEmail, userName, resetLink, validityDuration) => {
    const htmlContent = readEmailTemplate("password-reset-email.html", {
        userName,
        resetLink,
        validityDuration,
    });
    await (0, exports.sendEmail)({
        to: toEmail,
        subject: "Password Reset Request",
        html: htmlContent,
    });
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendInvoiceEmail = async (toEmail, invoiceNumber, amountDue, dueDate, downloadLink) => {
    const htmlContent = readEmailTemplate("invoice-email.html", {
        invoiceNumber,
        amountDue,
        dueDate,
        downloadLink: downloadLink || "#",
    });
    await (0, exports.sendEmail)({
        to: toEmail,
        subject: `Invoice #${invoiceNumber} - Amount Due: ${amountDue}`,
        html: htmlContent,
    });
};
exports.sendInvoiceEmail = sendInvoiceEmail;
const sendCustomEmail = async (toEmail, subject, body) => {
    const htmlContent = `
        <html>
            <body>
                <p>Dear recipient,</p>
                <p>${body}</p>
                <p>Regards,<br>Your Company</p>
            </body>
        </html>
    `;
    await (0, exports.sendEmail)({
        to: toEmail,
        subject: subject,
        html: htmlContent,
    });
};
exports.sendCustomEmail = sendCustomEmail;
//# sourceMappingURL=sendmail.js.map