"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rateLimitMiddleware_1 = __importDefault(require("../../middleware/rateLimitMiddleware"));
const user_service_1 = require("../../services/user.service");
const case_service_1 = require("../../services/case.service");
const subscription_service_1 = require("../../services/subscription.service");
const plan_service_1 = require("../../services/plan.service");
const audit_service_1 = require("../../services/audit.service");
const router = express_1.default.Router();
// GET /users - List all users
router.get("/users", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin"]), (0, rateLimitMiddleware_1.default)(), async (req, res, next) => {
    try {
        const { role, account_status, limit = 10, offset = 0 } = req.query;
        const filters = {
            role: role,
            account_status: account_status,
        };
        const pagination = {
            page: 1,
            limit: parseInt(limit),
        };
        const users = await user_service_1.UserService.getAllUsers(filters, pagination);
        res.json({ users });
    }
    catch (error) {
        next(error);
    }
});
// PUT /users/:userId/status - Update user status
router.put("/users/:userId/status", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin"]), (0, rateLimitMiddleware_1.default)(), async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { account_status } = req.body;
        await user_service_1.UserService.updateUserStatus(userId, account_status);
        res.json({ message: "User status updated successfully" });
    }
    catch (error) {
        next(error);
    }
});
// GET /cases - List all cases
router.get("/cases", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin"]), (0, rateLimitMiddleware_1.default)(), async (req, res, next) => {
    try {
        const { status, min_created_at, limit = 10, offset = 0 } = req.query;
        const filters = {
            status: status,
            min_created_at: min_created_at,
        };
        const pagination = {
            limit: parseInt(limit),
            offset: parseInt(offset),
        };
        const cases = await case_service_1.CaseService.getCasesForAdmin(filters, pagination);
        res.json({ cases });
    }
    catch (error) {
        next(error);
    }
});
// GET /subscriptions - List all subscriptions
router.get("/subscriptions", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin"]), (0, rateLimitMiddleware_1.default)(), async (req, res, next) => {
    try {
        const { status, min_price, max_price, limit = 10, offset = 0, } = req.query;
        const filters = {
            status: status,
            min_price: min_price ? parseFloat(min_price) : undefined,
            max_price: max_price ? parseFloat(max_price) : undefined,
        };
        const pagination = {
            limit: parseInt(limit),
            offset: parseInt(offset),
        };
        const subscriptions = await subscription_service_1.SubscriptionService.getAllSubscriptions(filters, pagination);
        res.json({ subscriptions });
    }
    catch (error) {
        next(error);
    }
});
// POST /subscriptions - Create a subscription
router.post("/subscriptions", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin"]), (0, rateLimitMiddleware_1.default)(), async (req, res, next) => {
    try {
        const subscriptionData = req.body;
        const subscription = await subscription_service_1.SubscriptionService.createSubscription(subscriptionData);
        res.status(201).json({ subscription });
    }
    catch (error) {
        next(error);
    }
});
// PUT /subscriptions/:id - Update a subscription
router.put("/subscriptions/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin"]), (0, rateLimitMiddleware_1.default)(), async (req, res, next) => {
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
// DELETE /subscriptions/:id - Delete a subscription
router.delete("/subscriptions/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin"]), (0, rateLimitMiddleware_1.default)(), async (req, res, next) => {
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
// GET /plans - List all plans
router.get("/plans", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin"]), (0, rateLimitMiddleware_1.default)(), async (req, res, next) => {
    try {
        const { limit = 10, offset = 0 } = req.query;
        const pagination = {
            limit: parseInt(limit),
            offset: parseInt(offset),
        };
        const plans = await plan_service_1.PlanService.getAllPlans();
        res.json({ plans });
    }
    catch (error) {
        next(error);
    }
});
// PUT /plans/:id - Update a plan
router.put("/plans/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin"]), (0, rateLimitMiddleware_1.default)(), async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const planData = req.body;
        const updatedPlan = await plan_service_1.PlanService.updatePlan(id, planData);
        if (!updatedPlan) {
            return res.status(404).json({ message: "Plan not found" });
        }
        res.json({ plan: updatedPlan });
    }
    catch (error) {
        next(error);
    }
});
// DELETE /plans/:id - Delete a plan
router.delete("/plans/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin"]), (0, rateLimitMiddleware_1.default)(), async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const deleted = await plan_service_1.PlanService.deletePlan(id);
        if (!deleted) {
            return res.status(404).json({ message: "Plan not found" });
        }
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
// GET /audit-logs - List audit logs
router.get("/audit-logs", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin"]), (0, rateLimitMiddleware_1.default)(), async (req, res, next) => {
    try {
        const { user_id, min_created_at, max_created_at, limit = 10, offset = 0, } = req.query;
        const filters = {
            user_id: user_id,
            min_created_at: min_created_at,
            max_created_at: max_created_at,
        };
        const pagination = {
            limit: parseInt(limit),
            offset: parseInt(offset),
        };
        const auditLogs = await audit_service_1.AuditService.getAllAuditLogs(filters, pagination);
        res.json({ auditLogs });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=admin.route.js.map