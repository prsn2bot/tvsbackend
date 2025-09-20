import { SubscriptionModel } from "../models/subscription.model";
import {
  Subscription,
  SubscriptionWithPlan,
} from "../types/subscription.types";
import { ErrorHelpers } from "../utils/errorHelpers";

export class SubscriptionService {
  static async getSubscriptionByUserId(
    userId: number
  ): Promise<SubscriptionWithPlan> {
    if (!userId) {
      throw ErrorHelpers.badRequest("User ID is required");
    }

    const subscription = await SubscriptionModel.findByUserId(userId);
    if (!subscription) {
      throw ErrorHelpers.notFound("Subscription");
    }

    return subscription;
  }

  static async getAllSubscriptions(
    filters: {
      status?: string;
      min_price?: number;
      max_price?: number;
      q?: string;
    },
    pagination: { limit: number; offset: number }
  ): Promise<{ data: SubscriptionWithPlan[]; total: number }> {
    return await SubscriptionModel.findAll(filters, pagination);
  }

  static async createSubscription(subscriptionData: {
    user_id: number;
    plan_id: number;
    payment_provider_subscription_id?: string;
    status: string;
    start_date?: Date;
    end_date?: Date;
  }): Promise<Subscription> {
    if (!subscriptionData.user_id || !subscriptionData.plan_id) {
      throw ErrorHelpers.missingFields(["user_id", "plan_id"]);
    }

    if (!subscriptionData.status) {
      throw ErrorHelpers.badRequest("Subscription status is required");
    }

    const validStatuses = [
      "active",
      "inactive",
      "cancelled",
      "expired",
      "pending",
    ];
    if (!validStatuses.includes(subscriptionData.status)) {
      throw ErrorHelpers.invalidInput(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      );
    }

    const data = {
      ...subscriptionData,
      start_date: subscriptionData.start_date || new Date(),
    };
    return await SubscriptionModel.create(data);
  }

  static async updateSubscription(
    id: number,
    subscriptionData: Partial<{
      status: string;
      end_date: Date;
      payment_provider_subscription_id: string;
    }>
  ): Promise<Subscription> {
    if (!id) {
      throw ErrorHelpers.badRequest("Subscription ID is required");
    }

    // Check if subscription exists first
    const existingSubscription = await SubscriptionModel.findByUserId(id);
    if (!existingSubscription) {
      throw ErrorHelpers.notFound("Subscription");
    }

    // Validate status if provided
    if (subscriptionData.status) {
      const validStatuses = [
        "active",
        "inactive",
        "cancelled",
        "expired",
        "pending",
      ];
      if (!validStatuses.includes(subscriptionData.status)) {
        throw ErrorHelpers.invalidInput(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`
        );
      }
    }

    const updatedSubscription = await SubscriptionModel.update(
      id,
      subscriptionData
    );
    if (!updatedSubscription) {
      throw ErrorHelpers.internalError("Failed to update subscription");
    }

    return updatedSubscription;
  }

  static async deleteSubscription(id: number): Promise<boolean> {
    if (!id) {
      throw ErrorHelpers.badRequest("Subscription ID is required");
    }

    // Check if subscription exists first
    const existingSubscription = await SubscriptionModel.findByUserId(id);
    if (!existingSubscription) {
      throw ErrorHelpers.notFound("Subscription");
    }

    const deleted = await SubscriptionModel.delete(id);
    if (!deleted) {
      throw ErrorHelpers.internalError("Failed to delete subscription");
    }

    return deleted;
  }
}
