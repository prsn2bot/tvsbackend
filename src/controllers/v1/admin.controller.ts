import { Request, Response, NextFunction } from "express";
import { UserService } from "../../services/user.service";
import { CaseService } from "../../services/case.service";
import { SubscriptionService } from "../../services/subscription.service";
import { PlanService } from "../../services/plan.service";
import { AuditService } from "../../services/audit.service";
import { asyncHandler } from "../../middleware/errorHandler.middleware";
import { AppError } from "../../utils/AppError";

export class AdminController {
  // GET /users - List all users
  static getUsers = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      // Query parameters are validated by middleware
      const { role, account_status, limit = 10, offset = 0 } = req.query;

      const filters = {
        role: role as string | undefined,
        account_status: account_status as string | undefined,
      };
      const pagination = {
        page: 1,
        limit: Number(limit) || 10,
      };

      const users = await UserService.getAllUsers(filters, pagination);

      res.json({
        success: true,
        message: "Users retrieved successfully",
        data: users,
      });
    }
  );

  // PUT /users/:userId/status - Update user status
  static updateUserStatus = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      // Parameters are validated and transformed by middleware
      const userId = Number(req.params.userId);
      const { account_status } = req.body;

      await UserService.updateUserStatus(userId, account_status);

      res.json({
        success: true,
        message: "User status updated successfully",
      });
    }
  );

  // PUT /users/:userId/role - Update user role (owner only)
  static updateUserRole = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = Number(req.params.userId);
      const { role } = req.body;

      await UserService.updateUserRole(userId, role);

      res.json({
        success: true,
        message: "User role updated successfully",
      });
    }
  );

  // GET /cases - List all cases
  static getCases = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { status, min_created_at, limit = 10, offset = 0 } = req.query;

      const filters = {
        status: status as string | undefined,
        min_created_at: min_created_at as string | undefined,
      };
      const pagination = {
        limit: Number(limit) || 10,
        offset: Number(offset) || 0,
      };

      const cases = await CaseService.getCasesForAdmin(filters, pagination);

      res.json({
        success: true,
        message: "Cases retrieved successfully",
        data: cases,
      });
    }
  );

  // GET /subscriptions - List all subscriptions
  static getSubscriptions = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const {
        status,
        min_price,
        max_price,
        limit = 10,
        offset = 0,
      } = req.query;

      const filters = {
        status: status as string | undefined,
        min_price: min_price ? Number(min_price) : undefined,
        max_price: max_price ? Number(max_price) : undefined,
      };
      const pagination = {
        limit: Number(limit) || 10,
        offset: Number(offset) || 0,
      };

      const subscriptions = await SubscriptionService.getAllSubscriptions(
        filters,
        pagination
      );

      res.json({
        success: true,
        message: "Subscriptions retrieved successfully",
        data: subscriptions,
      });
    }
  );

  // POST /subscriptions - Create a subscription
  static createSubscription = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const subscriptionData = req.body;

      const subscription = await SubscriptionService.createSubscription(
        subscriptionData
      );

      res.status(201).json({
        success: true,
        message: "Subscription created successfully",
        data: subscription,
      });
    }
  );

  // PUT /subscriptions/:id - Update a subscription
  static updateSubscription = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const id = Number(req.params.id);
      const subscriptionData = req.body;

      const updatedSubscription = await SubscriptionService.updateSubscription(
        id,
        subscriptionData
      );
      if (!updatedSubscription) {
        throw new AppError("Subscription not found", 404);
      }

      res.json({
        success: true,
        message: "Subscription updated successfully",
        data: updatedSubscription,
      });
    }
  );

  // DELETE /subscriptions/:id - Delete a subscription
  static deleteSubscription = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const id = Number(req.params.id);

      const deleted = await SubscriptionService.deleteSubscription(id);
      if (!deleted) {
        throw new AppError("Subscription not found", 404);
      }

      res.status(204).send();
    }
  );

  // GET /plans - List all plans
  static getPlans = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const plans = await PlanService.getAllPlans();

      res.json({
        success: true,
        message: "Plans retrieved successfully",
        data: plans,
      });
    }
  );

  // PUT /plans/:id - Update a plan
  static updatePlan = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const id = Number(req.params.id);
      const planData = req.body;

      const updatedPlan = await PlanService.updatePlan(id, planData);
      if (!updatedPlan) {
        throw new AppError("Plan not found", 404);
      }

      res.json({
        success: true,
        message: "Plan updated successfully",
        data: updatedPlan,
      });
    }
  );

  // DELETE /plans/:id - Delete a plan
  static deletePlan = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const id = Number(req.params.id);

      const deleted = await PlanService.deletePlan(id);
      if (!deleted) {
        throw new AppError("Plan not found", 404);
      }

      res.status(204).send();
    }
  );

  // GET /audit-logs - List audit logs
  static getAuditLogs = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const {
        user_id,
        min_created_at,
        max_created_at,
        limit = 10,
        offset = 0,
      } = req.query;

      const filters = {
        user_id: user_id ? Number(user_id) : undefined,
        min_created_at: min_created_at as string | undefined,
        max_created_at: max_created_at as string | undefined,
      };
      const pagination = {
        limit: Number(limit) || 10,
        offset: Number(offset) || 0,
      };

      const auditLogs = await AuditService.getAllAuditLogs(filters, pagination);

      res.json({
        success: true,
        message: "Audit logs retrieved successfully",
        data: auditLogs,
      });
    }
  );
}
