"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const subscription_service_1 = require("../services/subscription.service");
const subscriptionFeatureMiddleware = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const userId = req.user.userId;
        const userRole = req.user.role;
        // Bypass subscription check for admin and owner roles
        if (userRole === "admin" || userRole === "owner") {
            return next();
        }
        const subscription = await subscription_service_1.SubscriptionService.getSubscriptionByUserId(userId);
        if (!subscription || subscription.status !== "active") {
            return res.status(402).json({ message: "Active subscription required" });
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.default = subscriptionFeatureMiddleware;
//# sourceMappingURL=subscriptionFeature.middleware.js.map