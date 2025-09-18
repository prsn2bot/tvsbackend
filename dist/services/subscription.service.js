"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = void 0;
const subscription_model_1 = require("../models/subscription.model");
class SubscriptionService {
    static async getSubscriptionByUserId(userId) {
        return await subscription_model_1.SubscriptionModel.findByUserId(userId);
    }
    static async getAllSubscriptions(filters, pagination) {
        return await subscription_model_1.SubscriptionModel.findAll(filters, pagination);
    }
    static async createSubscription(subscriptionData) {
        const data = {
            ...subscriptionData,
            start_date: subscriptionData.start_date || new Date(),
        };
        return await subscription_model_1.SubscriptionModel.create(data);
    }
    static async updateSubscription(id, subscriptionData) {
        return await subscription_model_1.SubscriptionModel.update(id, subscriptionData);
    }
    static async deleteSubscription(id) {
        return await subscription_model_1.SubscriptionModel.delete(id);
    }
}
exports.SubscriptionService = SubscriptionService;
//# sourceMappingURL=subscription.service.js.map