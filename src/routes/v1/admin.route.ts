import express from "express";
import { authenticate, hasRole } from "../../middleware/auth.middleware";
import rateLimitMiddleware from "../../middleware/rateLimitMiddleware";
import {
  validateBody,
  validateQuery,
  validateParams,
  validateAll,
} from "../../middleware/validation.middleware";
import { AdminController } from "../../controllers/v1/admin.controller";
import {
  UpdateUserStatusDto,
  UpdateUserRoleDto,
  AdminQueryDto,
  AdminUserQueryDto,
  AdminCaseQueryDto,
  AdminSubscriptionQueryDto,
  UserParamsDto,
  SubscriptionParamsDto,
  PlanParamsDto,
} from "../../dto/admin.dto";
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
} from "../../dto/subscription.dto";
import { CreatePlanDto, UpdatePlanDto } from "../../dto/plan.dto";

const router = express.Router();

// GET /users - List all users
router.get(
  "/users",
  authenticate,
  hasRole(["admin", "owner"]),
  rateLimitMiddleware(),
  validateQuery(AdminUserQueryDto, "user"),
  AdminController.getUsers
);

// PUT /users/:userId/status - Update user status
router.put(
  "/users/:userId/status",
  authenticate,
  hasRole(["admin", "owner"]),
  rateLimitMiddleware(),
  validateAll(UpdateUserStatusDto, undefined, UserParamsDto, "user"),
  AdminController.updateUserStatus
);

// PUT /users/:userId/role - Update user role (owner only)
router.put(
  "/users/:userId/role",
  authenticate,
  hasRole(["owner"]),
  rateLimitMiddleware(),
  validateAll(UpdateUserRoleDto, undefined, UserParamsDto, "user"),
  AdminController.updateUserRole
);

// GET /cases - List all cases
router.get(
  "/cases",
  authenticate,
  hasRole(["admin", "owner"]),
  rateLimitMiddleware(),
  validateQuery(AdminCaseQueryDto, "case"),
  AdminController.getCases
);

// GET /subscriptions - List all subscriptions
router.get(
  "/subscriptions",
  authenticate,
  hasRole(["admin", "owner"]),
  rateLimitMiddleware(),
  validateQuery(AdminSubscriptionQueryDto, "subscription"),
  AdminController.getSubscriptions
);

// POST /subscriptions - Create a subscription
router.post(
  "/subscriptions",
  authenticate,
  hasRole(["admin", "owner"]),
  rateLimitMiddleware(),
  validateBody(CreateSubscriptionDto, "subscription"),
  AdminController.createSubscription
);

// PUT /subscriptions/:id - Update a subscription
router.put(
  "/subscriptions/:id",
  authenticate,
  hasRole(["admin", "owner"]),
  rateLimitMiddleware(),
  validateAll(
    UpdateSubscriptionDto,
    undefined,
    SubscriptionParamsDto,
    "subscription"
  ),
  AdminController.updateSubscription
);

// DELETE /subscriptions/:id - Delete a subscription
router.delete(
  "/subscriptions/:id",
  authenticate,
  hasRole(["admin", "owner"]),
  rateLimitMiddleware(),
  validateParams(SubscriptionParamsDto, "subscription"),
  AdminController.deleteSubscription
);

// GET /plans - List all plans
router.get(
  "/plans",
  authenticate,
  hasRole(["admin", "owner"]),
  rateLimitMiddleware(),
  AdminController.getPlans
);

// PUT /plans/:id - Update a plan
router.put(
  "/plans/:id",
  authenticate,
  hasRole(["admin", "owner"]),
  rateLimitMiddleware(),
  validateAll(UpdatePlanDto, undefined, PlanParamsDto, "plan"),
  AdminController.updatePlan
);

// DELETE /plans/:id - Delete a plan
router.delete(
  "/plans/:id",
  authenticate,
  hasRole(["admin", "owner"]),
  rateLimitMiddleware(),
  validateParams(PlanParamsDto, "plan"),
  AdminController.deletePlan
);

// GET /audit-logs - List audit logs
router.get(
  "/audit-logs",
  authenticate,
  hasRole(["admin", "owner"]),
  rateLimitMiddleware(),
  validateQuery(AdminQueryDto),
  AdminController.getAuditLogs
);

export default router;
