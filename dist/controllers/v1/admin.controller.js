"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const user_service_1 = require("../../services/user.service");
const case_service_1 = require("../../services/case.service");
const subscription_service_1 = require("../../services/subscription.service");
const plan_service_1 = require("../../services/plan.service");
const audit_service_1 = require("../../services/audit.service");
const errorHandler_middleware_1 = require("../../middleware/errorHandler.middleware");
const AppError_1 = require("../../utils/AppError");
class AdminController {
}
exports.AdminController = AdminController;
_a = AdminController;
// GET /users - List all users
AdminController.getUsers = (0, errorHandler_middleware_1.asyncHandler)(async (req, res, next) => {
    // Query parameters are validated by middleware
    const { role, account_status, limit = 10, offset = 0 } = req.query;
    const filters = {
        role: role,
        account_status: account_status,
    };
    const pagination = {
        page: 1,
        limit: Number(limit) || 10,
    };
    const users = await user_service_1.UserService.getAllUsers(filters, pagination);
    res.json({
        success: true,
        message: "Users retrieved successfully",
        data: users,
    });
});
// PUT /users/:userId/status - Update user status
AdminController.updateUserStatus = (0, errorHandler_middleware_1.asyncHandler)(async (req, res, next) => {
    // Parameters are validated and transformed by middleware
    const userId = Number(req.params.userId);
    const { account_status } = req.body;
    await user_service_1.UserService.updateUserStatus(userId, account_status);
    res.json({
        success: true,
        message: "User status updated successfully",
    });
});
// PUT /users/:userId/role - Update user role (owner only)
AdminController.updateUserRole = (0, errorHandler_middleware_1.asyncHandler)(async (req, res, next) => {
    const userId = Number(req.params.userId);
    const { role } = req.body;
    await user_service_1.UserService.updateUserRole(userId, role);
    res.json({
        success: true,
        message: "User role updated successfully",
    });
});
// GET /cases - List all cases
AdminController.getCases = (0, errorHandler_middleware_1.asyncHandler)(async (req, res, next) => {
    const { status, min_created_at, limit = 10, offset = 0 } = req.query;
    const filters = {
        status: status,
        min_created_at: min_created_at,
    };
    const pagination = {
        limit: Number(limit) || 10,
        offset: Number(offset) || 0,
    };
    const cases = await case_service_1.CaseService.getCasesForAdmin(filters, pagination);
    res.json({
        success: true,
        message: "Cases retrieved successfully",
        data: cases,
    });
});
// GET /subscriptions - List all subscriptions
AdminController.getSubscriptions = (0, errorHandler_middleware_1.asyncHandler)(async (req, res, next) => {
    const { status, min_price, max_price, limit = 10, offset = 0, } = req.query;
    const filters = {
        status: status,
        min_price: min_price ? Number(min_price) : undefined,
        max_price: max_price ? Number(max_price) : undefined,
    };
    const pagination = {
        limit: Number(limit) || 10,
        offset: Number(offset) || 0,
    };
    const subscriptions = await subscription_service_1.SubscriptionService.getAllSubscriptions(filters, pagination);
    res.json({
        success: true,
        message: "Subscriptions retrieved successfully",
        data: subscriptions,
    });
});
// POST /subscriptions - Create a subscription
AdminController.createSubscription = (0, errorHandler_middleware_1.asyncHandler)(async (req, res, next) => {
    const subscriptionData = req.body;
    const subscription = await subscription_service_1.SubscriptionService.createSubscription(subscriptionData);
    res.status(201).json({
        success: true,
        message: "Subscription created successfully",
        data: subscription,
    });
});
// PUT /subscriptions/:id - Update a subscription
AdminController.updateSubscription = (0, errorHandler_middleware_1.asyncHandler)(async (req, res, next) => {
    const id = Number(req.params.id);
    const subscriptionData = req.body;
    const updatedSubscription = await subscription_service_1.SubscriptionService.updateSubscription(id, subscriptionData);
    if (!updatedSubscription) {
        throw new AppError_1.AppError("Subscription not found", 404);
    }
    res.json({
        success: true,
        message: "Subscription updated successfully",
        data: updatedSubscription,
    });
});
// DELETE /subscriptions/:id - Delete a subscription
AdminController.deleteSubscription = (0, errorHandler_middleware_1.asyncHandler)(async (req, res, next) => {
    const id = Number(req.params.id);
    const deleted = await subscription_service_1.SubscriptionService.deleteSubscription(id);
    if (!deleted) {
        throw new AppError_1.AppError("Subscription not found", 404);
    }
    res.status(204).send();
});
// GET /plans - List all plans
AdminController.getPlans = (0, errorHandler_middleware_1.asyncHandler)(async (req, res, next) => {
    const plans = await plan_service_1.PlanService.getAllPlans();
    res.json({
        success: true,
        message: "Plans retrieved successfully",
        data: plans,
    });
});
// PUT /plans/:id - Update a plan
AdminController.updatePlan = (0, errorHandler_middleware_1.asyncHandler)(async (req, res, next) => {
    const id = Number(req.params.id);
    const planData = req.body;
    const updatedPlan = await plan_service_1.PlanService.updatePlan(id, planData);
    if (!updatedPlan) {
        throw new AppError_1.AppError("Plan not found", 404);
    }
    res.json({
        success: true,
        message: "Plan updated successfully",
        data: updatedPlan,
    });
});
// DELETE /plans/:id - Delete a plan
AdminController.deletePlan = (0, errorHandler_middleware_1.asyncHandler)(async (req, res, next) => {
    const id = Number(req.params.id);
    const deleted = await plan_service_1.PlanService.deletePlan(id);
    if (!deleted) {
        throw new AppError_1.AppError("Plan not found", 404);
    }
    res.status(204).send();
});
// GET /audit-logs - List audit logs
AdminController.getAuditLogs = (0, errorHandler_middleware_1.asyncHandler)(async (req, res, next) => {
    const { user_id, min_created_at, max_created_at, limit = 10, offset = 0, } = req.query;
    const filters = {
        user_id: user_id ? Number(user_id) : undefined,
        min_created_at: min_created_at,
        max_created_at: max_created_at,
    };
    const pagination = {
        limit: Number(limit) || 10,
        offset: Number(offset) || 0,
    };
    const auditLogs = await audit_service_1.AuditService.getAllAuditLogs(filters, pagination);
    res.json({
        success: true,
        message: "Audit logs retrieved successfully",
        data: auditLogs,
    });
});
//# sourceMappingURL=admin.controller.js.map