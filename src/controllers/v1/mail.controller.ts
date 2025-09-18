import { Request, Response, NextFunction } from "express";
import {
  sendOtpEmail,
  sendUpdateEmail,
  sendNotificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendInvoiceEmail,
  sendCustomEmail,
} from "../../utils/sendmail";
import { setCache, getCache, deleteCache } from "../../utils/cache";
import { UserService } from "../../services/user.service";
import { asyncHandler } from "../../middleware/errorHandler.middleware";
import { AppError } from "../../utils/AppError";
import {
  SendOtpDtoType,
  VerifyOtpDtoType,
  SendUpdateEmailDtoType,
  SendNotificationEmailDtoType,
  SendWelcomeEmailDtoType,
  SendPasswordResetEmailDtoType,
  SendInvoiceEmailDtoType,
  SendCustomEmailDtoType,
} from "../../dto/mail.dto";

const HOUR_IN_SECONDS = 3600;
const DAY_IN_SECONDS = 86400;
const MAX_OTP_VERIFY_ATTEMPTS = 5;

export class MailController {
  static sendOtp = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { to, validityDuration } = req.body as SendOtpDtoType;

      const normalizedEmail = to.toLowerCase();

      // Check if user exists
      const existingUser = await UserService.getUserByEmail(normalizedEmail);
      if (!existingUser) {
        throw new AppError("User with this email does not exist", 404);
      }

      const otpSendCacheKey = `otp_count_hourly_${normalizedEmail}`;
      let otpSendCount = getCache<number>(otpSendCacheKey) || 0;

      if (otpSendCount >= 3) {
        throw new AppError(
          "Too many OTP requests for this email address. Please try again after an hour",
          429
        );
      }

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      let ttlInSeconds = 600;
      const durationMatch = validityDuration.match(
        /(\d+)\s*(minute|second)s?/i
      );
      if (durationMatch) {
        const value = parseInt(durationMatch[1]);
        const unit = durationMatch[2].toLowerCase();
        if (unit.startsWith("minute")) {
          ttlInSeconds = value * 60;
        } else if (unit.startsWith("second")) {
          ttlInSeconds = value;
        }
      }

      setCache(`otp_${normalizedEmail}`, otpCode, ttlInSeconds);
      setCache(otpSendCacheKey, otpSendCount + 1, HOUR_IN_SECONDS);
      deleteCache(`otp_verify_attempts_${normalizedEmail}`);

      await sendOtpEmail(normalizedEmail, otpCode, validityDuration);

      res.status(200).json({
        success: true,
        message: "OTP email sent successfully",
        data: {
          otpCode: process.env.NODE_ENV === "development" ? otpCode : undefined,
        },
      });
    }
  );

  static verifyOtp = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { to, otpCode, is_verified, forgot_password } =
        req.body as VerifyOtpDtoType;

      const normalizedEmail = to.toLowerCase();

      const otpVerifyAttemptKey = `otp_verify_attempts_${normalizedEmail}`;
      let attempts = getCache<number>(otpVerifyAttemptKey) || 0;

      if (attempts >= MAX_OTP_VERIFY_ATTEMPTS) {
        throw new AppError(
          "Too many OTP verification attempts. Please try sending a new OTP",
          429
        );
      }

      const storedOtp = getCache<string>(`otp_${normalizedEmail}`);

      if (!storedOtp) {
        setCache(otpVerifyAttemptKey, attempts + 1, HOUR_IN_SECONDS);
        throw new AppError("OTP expired or invalid", 400);
      }

      if (storedOtp !== otpCode) {
        setCache(otpVerifyAttemptKey, attempts + 1, HOUR_IN_SECONDS);
        throw new AppError("Invalid OTP", 400);
      }

      deleteCache(`otp_${normalizedEmail}`);
      deleteCache(otpVerifyAttemptKey);

      const user = await UserService.getUserByEmail(normalizedEmail);

      if (!user) {
        throw new AppError("User not found", 404);
      }

      if (is_verified === true) {
        await UserService.updateUserStatus(user.id, "active");
      }

      if (forgot_password === true) {
        // Implement password reset token generation and response here if needed
      }

      res.status(200).json({
        success: true,
        message: "OTP verified successfully",
      });
    }
  );

  static sendUpdate = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { to, userName, updateDetails, actionLink } =
        req.body as SendUpdateEmailDtoType;

      await sendUpdateEmail(to, userName, updateDetails, actionLink);

      res.status(200).json({
        success: true,
        message: "Account update email sent successfully",
      });
    }
  );

  static sendNotification = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const {
        to,
        userName,
        notificationSubject,
        notificationBody,
        actionLink,
        actionText,
      } = req.body as SendNotificationEmailDtoType;

      await sendNotificationEmail(
        to,
        userName,
        notificationSubject,
        notificationBody,
        actionLink,
        actionText
      );

      res.status(200).json({
        success: true,
        message: "Notification email sent successfully",
      });
    }
  );

  static sendWelcome = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { to, userName, actionLink } = req.body as SendWelcomeEmailDtoType;

      const welcomeCacheKey = `welcome_sent_${to}`;
      if (getCache<boolean>(welcomeCacheKey)) {
        throw new AppError(
          "Welcome email already sent to this email address today",
          429
        );
      }
      setCache(welcomeCacheKey, true, DAY_IN_SECONDS);

      await sendWelcomeEmail(to, userName, actionLink);

      res.status(200).json({
        success: true,
        message: "Welcome email sent successfully",
      });
    }
  );

  static sendPasswordReset = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { to, userName, resetLink, validityDuration } =
        req.body as SendPasswordResetEmailDtoType;

      await sendPasswordResetEmail(to, userName, resetLink, validityDuration);

      res.status(200).json({
        success: true,
        message: "Password reset email sent successfully",
      });
    }
  );

  static sendInvoice = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { to, invoiceNumber, amountDue, dueDate, downloadLink } =
        req.body as SendInvoiceEmailDtoType;

      await sendInvoiceEmail(
        to,
        invoiceNumber,
        amountDue,
        dueDate,
        downloadLink
      );

      res.status(200).json({
        success: true,
        message: "Invoice email sent successfully",
      });
    }
  );

  static sendCustom = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { to, subject, body } = req.body as SendCustomEmailDtoType;

      await sendCustomEmail(to, subject, body);

      res.status(200).json({
        success: true,
        message: "Custom email sent successfully",
      });
    }
  );
}
