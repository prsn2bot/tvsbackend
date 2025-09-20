import { PlanModel } from "../models/plan.model";
import { Plan } from "../types/plan.types";
import { ErrorHelpers } from "../utils/errorHelpers";

export class PlanService {
  static async getAllPlans(queryParams?: {
    q?: string;
    page?: number;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Plan[]; total: number }> {
    return await PlanModel.findAll(queryParams);
  }

  static async getPlanById(id: number): Promise<Plan> {
    if (!id) {
      throw ErrorHelpers.badRequest("Plan ID is required");
    }

    const plan = await PlanModel.findById(id);
    if (!plan) {
      throw ErrorHelpers.notFound("Plan");
    }

    return plan;
  }

  static async createPlan(planData: {
    name: string;
    price_monthly: number;
    price_quarterly: number;
    price_half_yearly: number;
    price_yearly: number;
    is_popular: boolean;
    features: any;
  }): Promise<Plan> {
    if (!planData.name) {
      throw ErrorHelpers.badRequest("Plan name is required");
    }

    if (
      planData.price_monthly < 0 ||
      planData.price_quarterly < 0 ||
      planData.price_half_yearly < 0 ||
      planData.price_yearly < 0
    ) {
      throw ErrorHelpers.badRequest("Plan prices cannot be negative");
    }

    return await PlanModel.create(planData);
  }

  static async updatePlan(
    id: number,
    planData: Partial<{
      name: string;
      price_monthly: number;
      price_quarterly: number;
      price_half_yearly: number;
      price_yearly: number;
      is_popular: boolean;
      features: any;
    }>
  ): Promise<Plan> {
    if (!id) {
      throw ErrorHelpers.badRequest("Plan ID is required");
    }

    // Check if plan exists first
    const existingPlan = await PlanModel.findById(id);
    if (!existingPlan) {
      throw ErrorHelpers.notFound("Plan");
    }

    // Validate prices if provided
    if (planData.price_monthly !== undefined && planData.price_monthly < 0) {
      throw ErrorHelpers.badRequest("Monthly price cannot be negative");
    }
    if (
      planData.price_quarterly !== undefined &&
      planData.price_quarterly < 0
    ) {
      throw ErrorHelpers.badRequest("Quarterly price cannot be negative");
    }
    if (
      planData.price_half_yearly !== undefined &&
      planData.price_half_yearly < 0
    ) {
      throw ErrorHelpers.badRequest("Half-yearly price cannot be negative");
    }
    if (planData.price_yearly !== undefined && planData.price_yearly < 0) {
      throw ErrorHelpers.badRequest("Yearly price cannot be negative");
    }

    const updatedPlan = await PlanModel.update(id, planData);
    if (!updatedPlan) {
      throw ErrorHelpers.internalError("Failed to update plan");
    }

    return updatedPlan;
  }

  static async deletePlan(id: number): Promise<boolean> {
    if (!id) {
      throw ErrorHelpers.badRequest("Plan ID is required");
    }

    // Check if plan exists first
    const existingPlan = await PlanModel.findById(id);
    if (!existingPlan) {
      throw ErrorHelpers.notFound("Plan");
    }

    const deleted = await PlanModel.delete(id);
    if (!deleted) {
      throw ErrorHelpers.internalError("Failed to delete plan");
    }

    return deleted;
  }
}
