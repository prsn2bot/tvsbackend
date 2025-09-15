"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const audit_service_1 = require("../services/audit.service");
const crypto_1 = __importDefault(require("crypto"));
const usageTrackingMiddleware = (req, res, next) => {
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
                const hash = crypto_1.default
                    .createHash("sha256")
                    .update(JSON.stringify(details))
                    .digest("hex");
                const usageData = {
                    user_id: req.user.userId,
                    action: `${req.method} ${req.path}`,
                    details,
                    current_hash: hash,
                };
                await audit_service_1.AuditService.createAuditLog(usageData);
            }
        }
        catch (error) {
            // Log error but don't fail the response
            console.error("Usage tracking error:", error);
        }
    });
    next();
};
exports.default = usageTrackingMiddleware;
//# sourceMappingURL=usageTracking.middleware.js.map