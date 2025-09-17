import express from "express";
import { authenticate, hasRole } from "../../middleware/auth.middleware";
import rateLimitMiddleware from "../../middleware/rateLimitMiddleware";
import { UserService } from "../../services/user.service";
import { CaseService } from "../../services/case.service";
import { SubscriptionService } from "../../services/subscription.service";
import { PlanService } from "../../services/plan.service";
import { AuditService } from "../../services/audit.service";

const router = express.Router();

// GET /users - List all users
router.get(
  "/users",
  authenticate,
  hasRole(["admin", "owner"]),
  rateLimitMiddleware(),
  async (req, res, next) => {
    try {
      const { role, account_status, limit = 10, offset = 0 } = req.query;
      const filters = {
        role: role as string | undefined,
        account_status: account_status as string | undefined,
      };
      const pagination = {
        page: 1,
        limit: parseInt(limit as string),
      };
      const users = await UserService.getAllUsers(filters, pagination);
      res.json({ users });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /users/:userId/status - Update user status
router.put(
  "/users/:userId/status",
  authenticate,
  hasRole(["admin", "owner"]),
  rateLimitMiddleware(),
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { account_status } = req.body;
      await UserService.updateUserStatus(userId, account_status);
      res.json({ message: "User status updated successfully" });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /users/:userId/role - Update user role (owner only)
router.put(
  "/users/:userId/role",
  authenticate,
  hasRole(["owner"]),
  rateLimitMiddleware(),
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      await UserService.updateUserRole(userId, role);
      res.json({ message: "User role updated successfully" });
    } catch (error) {
      next(error);
    }
  }
);

// GET /cases - List all cases
router.get(
  "/cases",
  authenticate,
  hasRole(["admin", "owner"]),
  rateLimitMiddleware(),
  async (req, res, next) => {
    try {
      const { status, min_created_at, limit = 10, offset = 0 } = req.query;
      const filters = {
        status: status as string | undefined,
        min_created_at: min_created_at as string | undefined,
      };
      const pagination = {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      };
      const cases = await CaseService.getCasesForAdmin(filters, pagination);
      res.json({ cases });
    } catch (error) {
      next(error);
    }
  }
);

// GET /subscriptions - List all subscriptions
router.get(
  "/subscriptions",
  authenticate,
  hasRole(["admin", "owner"]),
  rateLimitMiddleware(),
  async (req, res, next) => {
    try {
      const {
        status,
        min_price,
        max_price,
        limit = 10,
        offset = 0,
      } = req.query;
      const filters = {
        status: status as string | undefined,
        min_price: min_price ? parseFloat(min_price as string) : undefined,
        max_price: max_price ? parseFloat(max_price as string) : undefined,
      };
      const pagination = {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      };
      const subscriptions = await SubscriptionService.getAllSubscriptions(
        filters,
        pagination
      );
      res.json({ subscriptions });
    } catch (error) {
      next(error);
    }
  }
);

// POST /subscriptions - Create a subscription
router.post(
  "/subscriptions",
  authenticate,
  hasRole(["admin", "owner"]),
  rateLimitMiddleware(),
  async (req, res, next) => {
    try {
      const subscriptionData = req.body;
      const subscription = await SubscriptionService.createSubscription(
        subscriptionData
      );
      res.status(201).json({ subscription });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /subscriptions/:id - Update a subscription
router.put(
  "/subscriptions/:id",
  authenticate,
  hasRole(["admin", "owner"]),
  rateLimitMiddleware(),
  async (req, res, next) => {
    try {
      const id = req.params.id;
      const subscriptionData = req.body;
      const updatedSubscription = await SubscriptionService.updateSubscription(
        id,
        subscriptionData
      );
      if (!updatedSubscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      res.json({ subscription: updatedSubscription });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /subscriptions/:id - Delete a subscription
router.delete(
  "/subscriptions/:id",
  authenticate,
  hasRole(["admin", "owner"]),
  rateLimitMiddleware(),
  async (req, res, next) => {
    try {
      const id = req.params.id;
      const deleted = await SubscriptionService.deleteSubscription(id);
      if (!deleted) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

// GET /plans - List all plans
router.get(
  "/plans",
  authenticate,
  hasRole(["admin", "owner"]),
  rateLimitMiddleware(),
  async (req, res, next) => {
    try {
      const { limit = 10, offset = 0 } = req.query;
      const pagination = {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      };
      const plans = await PlanService.getAllPlans();
      res.json({ plans });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /plans/:id - Update a plan
router.put(
  "/plans/:id",
  authenticate,
  hasRole(["admin", "owner"]),
  rateLimitMiddleware(),
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const planData = req.body;
      const updatedPlan = await PlanService.updatePlan(id, planData);
      if (!updatedPlan) {
        return res.status(404).json({ message: "Plan not found" });
      }
      res.json({ plan: updatedPlan });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /plans/:id - Delete a plan
router.delete(
  "/plans/:id",
  authenticate,
  hasRole(["admin", "owner"]),
  rateLimitMiddleware(),
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await PlanService.deletePlan(id);
      if (!deleted) {
        return res.status(404).json({ message: "Plan not found" });
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

// GET /audit-logs - List audit logs
router.get(
  "/audit-logs",
  authenticate,
  hasRole(["admin", "owner"]),
  rateLimitMiddleware(),
  async (req, res, next) => {
    try {
      const {
        user_id,
        min_created_at,
        max_created_at,
        limit = 10,
        offset = 0,
      } = req.query;
      const filters = {
        user_id: user_id as string | undefined,
        min_created_at: min_created_at as string | undefined,
        max_created_at: max_created_at as string | undefined,
      };
      const pagination = {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      };
      const auditLogs = await AuditService.getAllAuditLogs(filters, pagination);
      res.json({ auditLogs });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
