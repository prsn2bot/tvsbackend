import { PlanModel } from "../models/plan.model";
import { Plan } from "../types/plan.types";

export class PlanService {
  static async getAllPlans(queryParams?: {
    q?: string;
    page?: number;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Plan[]; total: number }> {
    return await PlanModel.findAll(queryParams);
  }

  static async getPlanById(id: number): Promise<Plan | null> {
    return await PlanModel.findById(id);
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
  ): Promise<Plan | null> {
    return await PlanModel.update(id, planData);
  }

  static async deletePlan(id: number): Promise<boolean> {
    return await PlanModel.delete(id);
  }
}
