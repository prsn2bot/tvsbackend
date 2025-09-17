import { SubscriptionModel } from "../models/subscription.model";
import {
  Subscription,
  SubscriptionWithPlan,
} from "../types/subscription.types";

export class SubscriptionService {
  static async getSubscriptionByUserId(
    userId: number
  ): Promise<SubscriptionWithPlan | null> {
    return await SubscriptionModel.findByUserId(userId);
  }

  static async getAllSubscriptions(
    filters: { status?: string; min_price?: number; max_price?: number },
    pagination: { limit: number; offset: number }
  ): Promise<{ data: SubscriptionWithPlan[]; total: number }> {
    return await SubscriptionModel.findAll(filters, pagination);
  }

  static async createSubscription(subscriptionData: {
    user_id: string;
    plan_id: number;
    payment_provider_subscription_id?: string;
    status: string;
    start_date: Date;
    end_date?: Date;
  }): Promise<Subscription> {
    return await SubscriptionModel.create(subscriptionData);
  }

  static async updateSubscription(
    id: string,
    subscriptionData: Partial<{
      status: string;
      end_date: Date;
      payment_provider_subscription_id: string;
    }>
  ): Promise<Subscription | null> {
    return await SubscriptionModel.update(id, subscriptionData);
  }

  static async deleteSubscription(id: string): Promise<boolean> {
    return await SubscriptionModel.delete(id);
  }
}
