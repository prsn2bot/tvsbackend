import express from "express";
import { authenticate, hasRole } from "../../middleware/auth.middleware";
import rateLimitMiddleware from "../../middleware/rateLimitMiddleware";
import {
  validateQuery,
  validateBody,
  validateParams,
} from "../../middleware/validation.middleware";
import {
  PlanQueryDto,
  CreatePlanDto,
  UpdatePlanDto,
  PlanParamsDto,
} from "../../dto/plan.dto";
import { PlanService } from "../../services/plan.service";

const router = express.Router();

// GET / - List available plans with search
router.get(
  "/",
  rateLimitMiddleware(),
  validateQuery(PlanQueryDto, "plan"),
  async (req, res, next) => {
    try {
      const queryParams = req.query as any;
      const result = await PlanService.getAllPlans(queryParams);
      res.json({
        plans: result.data,
        total: result.total,
        page: queryParams.page || 1,
        limit: queryParams.limit || 10,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /:id - Get a specific plan
router.get(
  "/:id",
  rateLimitMiddleware(),
  validateParams(PlanParamsDto, "plan"),
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const plan = await PlanService.getPlanById(id);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }
      res.json({ plan });
    } catch (error) {
      next(error);
    }
  }
);

// POST / - Create a new plan
router.post(
  "/",
  authenticate,
  hasRole(["admin", "owner"]),
  rateLimitMiddleware(),
  validateBody(CreatePlanDto, "plan"),
  async (req, res, next) => {
    try {
      const planData = req.body;
      const plan = await PlanService.createPlan(planData);
      res.status(201).json({ plan });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /:id - Update a plan
router.put(
  "/:id",
  authenticate,
  hasRole(["admin", "owner"]),
  rateLimitMiddleware(),
  validateParams(PlanParamsDto, "plan"),
  validateBody(UpdatePlanDto, "plan"),
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

// DELETE /:id - Delete a plan
router.delete(
  "/:id",
  authenticate,
  hasRole(["admin", "owner"]),
  rateLimitMiddleware(),
  validateParams(PlanParamsDto, "plan"),
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

export default router;
