import express from "express";
import { authenticate, hasRole } from "../../middleware/auth.middleware";
import rateLimitMiddleware from "../../middleware/rateLimitMiddleware";
import { PlanService } from "../../services/plan.service";

const router = express.Router();

// GET / - List available plans
router.get("/", rateLimitMiddleware(), async (req, res, next) => {
  try {
    const plans = await PlanService.getAllPlans();
    res.json({ plans });
  } catch (error) {
    next(error);
  }
});

// GET /:id - Get a specific plan
router.get("/:id", rateLimitMiddleware(), async (req, res, next) => {
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
});

// POST / - Create a new plan
router.post(
  "/",
  authenticate,
  hasRole(["admin"]),
  rateLimitMiddleware(),
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
  hasRole(["admin"]),
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

// DELETE /:id - Delete a plan
router.delete(
  "/:id",
  authenticate,
  hasRole(["admin"]),
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

export default router;
