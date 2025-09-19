"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanService = void 0;
const plan_model_1 = require("../models/plan.model");
class PlanService {
    static async getAllPlans(queryParams) {
        return await plan_model_1.PlanModel.findAll(queryParams);
    }
    static async getPlanById(id) {
        return await plan_model_1.PlanModel.findById(id);
    }
    static async createPlan(planData) {
        return await plan_model_1.PlanModel.create(planData);
    }
    static async updatePlan(id, planData) {
        return await plan_model_1.PlanModel.update(id, planData);
    }
    static async deletePlan(id) {
        return await plan_model_1.PlanModel.delete(id);
    }
}
exports.PlanService = PlanService;
//# sourceMappingURL=plan.service.js.map