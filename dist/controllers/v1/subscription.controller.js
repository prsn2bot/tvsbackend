"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionController = void 0;
const subscription_service_1 = require("../../services/subscription.service");
class SubscriptionController {
    /**
     * Get user's active subscription
     */
    static async getSubscription(req, res, next) {
        try {
            const userId = req.user.userId;
            const subscription = await subscription_service_1.SubscriptionService.getSubscriptionByUserId(userId);
            res.json({ subscription });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Create a new subscription
     */
    static async createSubscription(req, res, next) {
        try {
            const subscriptionData = req.body;
            const subscription = await subscription_service_1.SubscriptionService.createSubscription(subscriptionData);
            res.status(201).json({ subscription });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Update an existing subscription
     */
    static async updateSubscription(req, res, next) {
        try {
            const { id } = req.params;
            const subscriptionData = req.body;
            // Convert id to number (validation middleware ensures it's valid)
            const numericId = parseInt(id, 10);
            const updatedSubscription = await subscription_service_1.SubscriptionService.updateSubscription(numericId, subscriptionData);
            if (!updatedSubscription) {
                res.status(404).json({ message: "Subscription not found" });
                return;
            }
            res.json({ subscription: updatedSubscription });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Delete/cancel a subscription
     */
    static async deleteSubscription(req, res, next) {
        try {
            const { id } = req.params;
            // Convert id to number (validation middleware ensures it's valid)
            const numericId = parseInt(id, 10);
            const deleted = await subscription_service_1.SubscriptionService.deleteSubscription(numericId);
            if (!deleted) {
                res.status(404).json({ message: "Subscription not found" });
                return;
            }
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SubscriptionController = SubscriptionController;
//# sourceMappingURL=subscription.controller.js.map