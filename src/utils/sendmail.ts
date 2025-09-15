import nodemailer from "nodemailer";
import { emailConfig } from "../config/email";
import * as fs from "fs";
import * as path from "path";
import { env } from "../config/env";
import logger from "./logger";
const websiteUrl = env.WEBSITE;
const companyMail = env.COMPANY_MAIL;

interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure,
  auth: {
    user: emailConfig.auth.user,
    pass: emailConfig.auth.pass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});
export const sendEmail = async (options: EmailOptions) => {
  try {
    const mailOptions = {
      from: emailConfig.auth.user,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.debug("Email sent: %s", info.messageId);
    return info;
  } catch (error) {
    logger.error("Error sending email:", error);
    throw error;
  }
};

const readEmailTemplate = (
  templateName: string,
  replacements: { [key: string]: string }
): string => {
  const templatePath = path.join(__dirname, "../templates", templateName);
  let htmlContent = fs.readFileSync(templatePath, "utf8");
  for (const key in replacements) {
    htmlContent = htmlContent.replace(
      new RegExp(`{{${key}}}`, "g"),
      replacements[key]
    );
  }
  return htmlContent;
};

export const sendOtpEmail = async (
  toEmail: string,
  otpCode: string,
  validityDuration: string
) => {
  const htmlContent = readEmailTemplate("otp-email.html", {
    otpCode,
    validityDuration,
    websiteUrl,
    companyMail,
  });
  await sendEmail({
    to: toEmail,
    subject: "Your One-Time Password (OTP)",
    html: htmlContent,
  });
};

export const sendUpdateEmail = async (
  toEmail: string,
  userName: string,
  updateDetails: string,
  actionLink?: string
) => {
  const htmlContent = readEmailTemplate("update-email.html", {
    userName,
    updateDetails,
    actionLink: actionLink || "#",
  });
  await sendEmail({
    to: toEmail,
    subject: "Account Update Notification",
    html: htmlContent,
  });
};

export const sendNotificationEmail = async (
  toEmail: string,
  userName: string,
  notificationSubject: string,
  notificationBody: string,
  actionLink?: string,
  actionText?: string
) => {
  const htmlContent = readEmailTemplate("notification-email.html", {
    userName,
    notificationSubject,
    notificationBody,
    actionLink: actionLink || "",
    actionText: actionText || "",
  });
  await sendEmail({
    to: toEmail,
    subject: notificationSubject,
    html: htmlContent,
  });
};

export const sendWelcomeEmail = async (
  toEmail: string,
  userName: string,
  actionLink?: string
) => {
  const htmlContent = readEmailTemplate("welcome-email.html", {
    userName,
    actionLink: actionLink || "#",
  });
  await sendEmail({
    to: toEmail,
    subject: "Welcome to Our Service!",
    html: htmlContent,
  });
};

export const sendPasswordResetEmail = async (
  toEmail: string,
  userName: string,
  resetLink: string,
  validityDuration: string
) => {
  const htmlContent = readEmailTemplate("password-reset-email.html", {
    userName,
    resetLink,
    validityDuration,
  });
  await sendEmail({
    to: toEmail,
    subject: "Password Reset Request",
    html: htmlContent,
  });
};

export const sendInvoiceEmail = async (
  toEmail: string,
  invoiceNumber: string,
  amountDue: string,
  dueDate: string,
  downloadLink?: string
) => {
  const htmlContent = readEmailTemplate("invoice-email.html", {
    invoiceNumber,
    amountDue,
    dueDate,
    downloadLink: downloadLink || "#",
  });
  await sendEmail({
    to: toEmail,
    subject: `Invoice #${invoiceNumber} - Amount Due: ${amountDue}`,
    html: htmlContent,
  });
};

export const sendCustomEmail = async (
  toEmail: string,
  subject: string,
  body: string
) => {
  const htmlContent = `
        <html>
            <body>
                <p>Dear recipient,</p>
                <p>${body}</p>
                <p>Regards,<br>Your Company</p>
            </body>
        </html>
    `;
  await sendEmail({
    to: toEmail,
    subject: subject,
    html: htmlContent,
  });
};
