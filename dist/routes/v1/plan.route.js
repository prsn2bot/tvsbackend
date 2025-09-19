"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rateLimitMiddleware_1 = __importDefault(require("../../middleware/rateLimitMiddleware"));
const validation_middleware_1 = require("../../middleware/validation.middleware");
const plan_dto_1 = require("../../dto/plan.dto");
const plan_service_1 = require("../../services/plan.service");
const router = express_1.default.Router();
// GET / - List available plans with search
router.get("/", (0, rateLimitMiddleware_1.default)(), (0, validation_middleware_1.validateQuery)(plan_dto_1.PlanQueryDto, "plan"), async (req, res, next) => {
    try {
        const queryParams = req.query;
        const result = await plan_service_1.PlanService.getAllPlans(queryParams);
        res.json({
            plans: result.data,
            total: result.total,
            page: queryParams.page || 1,
            limit: queryParams.limit || 10,
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /:id - Get a specific plan
router.get("/:id", (0, rateLimitMiddleware_1.default)(), (0, validation_middleware_1.validateParams)(plan_dto_1.PlanParamsDto, "plan"), async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const plan = await plan_service_1.PlanService.getPlanById(id);
        if (!plan) {
            return res.status(404).json({ message: "Plan not found" });
        }
        res.json({ plan });
    }
    catch (error) {
        next(error);
    }
});
// POST / - Create a new plan
router.post("/", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin", "owner"]), (0, rateLimitMiddleware_1.default)(), (0, validation_middleware_1.validateBody)(plan_dto_1.CreatePlanDto, "plan"), async (req, res, next) => {
    try {
        const planData = req.body;
        const plan = await plan_service_1.PlanService.createPlan(planData);
        res.status(201).json({ plan });
    }
    catch (error) {
        next(error);
    }
});
// PUT /:id - Update a plan
router.put("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin", "owner"]), (0, rateLimitMiddleware_1.default)(), (0, validation_middleware_1.validateParams)(plan_dto_1.PlanParamsDto, "plan"), (0, validation_middleware_1.validateBody)(plan_dto_1.UpdatePlanDto, "plan"), async (req, res, next) => {
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
// DELETE /:id - Delete a plan
router.delete("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin", "owner"]), (0, rateLimitMiddleware_1.default)(), (0, validation_middleware_1.validateParams)(plan_dto_1.PlanParamsDto, "plan"), async (req, res, next) => {
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
exports.default = router;
//# sourceMappingURL=plan.route.js.map