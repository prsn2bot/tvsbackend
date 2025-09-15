"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rateLimitMiddleware_1 = __importDefault(require("../../middleware/rateLimitMiddleware"));
const subscription_service_1 = require("../../services/subscription.service");
const router = express_1.default.Router();
// GET / - Get user's active subscription
router.get("/", auth_middleware_1.authenticate, (0, rateLimitMiddleware_1.default)(), async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const subscription = await subscription_service_1.SubscriptionService.getSubscriptionByUserId(userId);
        res.json({ subscription });
    }
    catch (error) {
        next(error);
    }
});
// POST / - Create a subscription
router.post("/", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin"]), (0, rateLimitMiddleware_1.default)(), async (req, res, next) => {
    try {
        const subscriptionData = req.body;
        const subscription = await subscription_service_1.SubscriptionService.createSubscription(subscriptionData);
        res.status(201).json({ subscription });
    }
    catch (error) {
        next(error);
    }
});
// PUT /:id - Update a subscription
router.put("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin"]), (0, rateLimitMiddleware_1.default)(), async (req, res, next) => {
    try {
        const id = req.params.id;
        const subscriptionData = req.body;
        const updatedSubscription = await subscription_service_1.SubscriptionService.updateSubscription(id, subscriptionData);
        if (!updatedSubscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }
        res.json({ subscription: updatedSubscription });
    }
    catch (error) {
        next(error);
    }
});
// DELETE /:id - Cancel a subscription
router.delete("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin"]), (0, rateLimitMiddleware_1.default)(), async (req, res, next) => {
    try {
        const id = req.params.id;
        const deleted = await subscription_service_1.SubscriptionService.deleteSubscription(id);
        if (!deleted) {
            return res.status(404).json({ message: "Subscription not found" });
        }
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=subscription.route.js.map