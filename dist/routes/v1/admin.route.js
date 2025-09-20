"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rateLimitMiddleware_1 = __importDefault(require("../../middleware/rateLimitMiddleware"));
const validation_middleware_1 = require("../../middleware/validation.middleware");
const admin_controller_1 = require("../../controllers/v1/admin.controller");
const admin_dto_1 = require("../../dto/admin.dto");
const subscription_dto_1 = require("../../dto/subscription.dto");
const plan_dto_1 = require("../../dto/plan.dto");
const router = express_1.default.Router();
// GET /users - List all users
router.get("/users", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin", "owner"]), (0, rateLimitMiddleware_1.default)(), (0, validation_middleware_1.validateQuery)(admin_dto_1.AdminUserQueryDto, "user"), admin_controller_1.AdminController.getUsers);
// PUT /users/:userId/status - Update user status
router.put("/users/:userId/status", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin", "owner"]), (0, rateLimitMiddleware_1.default)(), (0, validation_middleware_1.validateAll)(admin_dto_1.UpdateUserStatusDto, undefined, admin_dto_1.UserParamsDto, "user"), admin_controller_1.AdminController.updateUserStatus);
// PUT /users/:userId/role - Update user role (owner only)
router.put("/users/:userId/role", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["owner"]), (0, rateLimitMiddleware_1.default)(), (0, validation_middleware_1.validateAll)(admin_dto_1.UpdateUserRoleDto, undefined, admin_dto_1.UserParamsDto, "user"), admin_controller_1.AdminController.updateUserRole);
// GET /cases - List all cases
router.get("/cases", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin", "owner"]), (0, rateLimitMiddleware_1.default)(), (0, validation_middleware_1.validateQuery)(admin_dto_1.AdminCaseQueryDto, "case"), admin_controller_1.AdminController.getCases);
// POST /cases/:caseId/assign-cvo - Assign case to CVO
router.post("/cases/:caseId/assign-cvo", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin", "owner"]), (0, rateLimitMiddleware_1.default)(), (0, validation_middleware_1.validateAll)(admin_dto_1.AssignCvoDto, undefined, admin_dto_1.CaseParamsDto, "case"), admin_controller_1.AdminController.assignCaseToCVO);
// POST /cases/:caseId/assign-legal-board - Assign case to legal board
router.post("/cases/:caseId/assign-legal-board", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin", "owner"]), (0, rateLimitMiddleware_1.default)(), (0, validation_middleware_1.validateAll)(admin_dto_1.AssignLegalBoardDto, undefined, admin_dto_1.CaseParamsDto, "case"), admin_controller_1.AdminController.assignCaseToLegalBoard);
// GET /subscriptions - List all subscriptions
router.get("/subscriptions", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin", "owner"]), (0, rateLimitMiddleware_1.default)(), (0, validation_middleware_1.validateQuery)(admin_dto_1.AdminSubscriptionQueryDto, "subscription"), admin_controller_1.AdminController.getSubscriptions);
// POST /subscriptions - Create a subscription
router.post("/subscriptions", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin", "owner"]), (0, rateLimitMiddleware_1.default)(), (0, validation_middleware_1.validateBody)(subscription_dto_1.CreateSubscriptionDto, "subscription"), admin_controller_1.AdminController.createSubscription);
// PUT /subscriptions/:id - Update a subscription
router.put("/subscriptions/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin", "owner"]), (0, rateLimitMiddleware_1.default)(), (0, validation_middleware_1.validateAll)(subscription_dto_1.UpdateSubscriptionDto, undefined, admin_dto_1.SubscriptionParamsDto, "subscription"), admin_controller_1.AdminController.updateSubscription);
// DELETE /subscriptions/:id - Delete a subscription
router.delete("/subscriptions/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin", "owner"]), (0, rateLimitMiddleware_1.default)(), (0, validation_middleware_1.validateParams)(admin_dto_1.SubscriptionParamsDto, "subscription"), admin_controller_1.AdminController.deleteSubscription);
// GET /plans - List all plans
router.get("/plans", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin", "owner"]), (0, rateLimitMiddleware_1.default)(), (0, validation_middleware_1.validateQuery)(admin_dto_1.AdminPlanQueryDto, "plan"), admin_controller_1.AdminController.getPlans);
// PUT /plans/:id - Update a plan
router.put("/plans/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin", "owner"]), (0, rateLimitMiddleware_1.default)(), (0, validation_middleware_1.validateAll)(plan_dto_1.UpdatePlanDto, undefined, admin_dto_1.PlanParamsDto, "plan"), admin_controller_1.AdminController.updatePlan);
// DELETE /plans/:id - Delete a plan
router.delete("/plans/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin", "owner"]), (0, rateLimitMiddleware_1.default)(), (0, validation_middleware_1.validateParams)(admin_dto_1.PlanParamsDto, "plan"), admin_controller_1.AdminController.deletePlan);
// GET /audit-logs - List audit logs
router.get("/audit-logs", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin", "owner"]), (0, rateLimitMiddleware_1.default)(), (0, validation_middleware_1.validateQuery)(admin_dto_1.AdminAuditLogQueryDto, "audit-log"), admin_controller_1.AdminController.getAuditLogs);
exports.default = router;
//# sourceMappingURL=admin.route.js.map