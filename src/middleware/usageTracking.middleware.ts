import { Request, Response, NextFunction } from "express";
import { AuditService } from "../services/audit.service";
import crypto from "crypto";

const usageTrackingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();

  res.on("finish", async () => {
    try {
      if (req.user) {
        const duration = Date.now() - startTime;
        const details = {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration,
          userAgent: req.get("User-Agent"),
          ip: req.ip,
        };

        // Create a hash of the details for integrity
        const hash = crypto
          .createHash("sha256")
          .update(JSON.stringify(details))
          .digest("hex");

        const usageData = {
          user_id: req.user.userId,
          action: `${req.method} ${req.path}`,
          details,
          current_hash: hash,
        };

        await AuditService.createAuditLog(usageData);
      }
    } catch (error) {
      // Log error but don't fail the response
      console.error("Usage tracking error:", error);
    }
  });

  next();
};

export default usageTrackingMiddleware;
