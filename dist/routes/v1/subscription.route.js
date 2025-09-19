"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rateLimitMiddleware_1 = __importDefault(require("../../middleware/rateLimitMiddleware"));
const validation_middleware_1 = require("../../middleware/validation.middleware");
const subscription_dto_1 = require("../../dto/subscription.dto");
const subscription_controller_1 = require("../../controllers/v1/subscription.controller");
const router = express_1.default.Router();
// GET / - Get user's active subscription
router.get("/", auth_middleware_1.authenticate, (0, rateLimitMiddleware_1.default)(), subscription_controller_1.SubscriptionController.getSubscription);
// POST / - Create a subscription
router.post("/", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin", "owner"]), (0, rateLimitMiddleware_1.default)(), (0, validation_middleware_1.validateBody)(subscription_dto_1.CreateSubscriptionDto, "subscription"), subscription_controller_1.SubscriptionController.createSubscription);
// PUT /:id - Update a subscription
router.put("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin", "owner"]), (0, rateLimitMiddleware_1.default)(), (0, validation_middleware_1.validateParams)(subscription_dto_1.SubscriptionParamsDto, "subscription"), (0, validation_middleware_1.validateBody)(subscription_dto_1.UpdateSubscriptionDto, "subscription"), subscription_controller_1.SubscriptionController.updateSubscription);
// DELETE /:id - Cancel a subscription
router.delete("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin", "owner"]), (0, rateLimitMiddleware_1.default)(), (0, validation_middleware_1.validateParams)(subscription_dto_1.SubscriptionParamsDto, "subscription"), subscription_controller_1.SubscriptionController.deleteSubscription);
exports.default = router;
//# sourceMappingURL=subscription.route.js.map