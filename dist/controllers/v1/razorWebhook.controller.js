"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRazorpayWebhook = void 0;
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = __importDefault(require("../../utils/logger"));
const env_1 = require("../../config/env");
const subscription_service_1 = require("../../services/subscription.service");
// This function activates the subscription upon successful payment.
const activateSubscription = async (userId, planId, paymentId, orderId) => {
    logger_1.default.info(`Activating subscription for user ${userId} with plan ${planId}`);
    try {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1); // Assuming monthly subscription
        const newSubscription = await subscription_service_1.SubscriptionService.createSubscription({
            user_id: parseInt(userId, 10),
            plan_id: planId,
            payment_provider_subscription_id: orderId,
            status: "active",
            start_date: startDate,
            end_date: endDate,
        });
        logger_1.default.info(`Subscription activated for user ${userId}. Subscription ID: ${newSubscription.id}`);
        return { success: true, subscription: newSubscription };
    }
    catch (error) {
        logger_1.default.error(`Error activating subscription for user ${userId}: ${error.message}`);
        throw new Error(`Failed to activate subscription: ${error.message}`);
    }
};
const handleRazorpayWebhook = async (req, res, next) => {
    const signature = req.headers["x-razorpay-signature"];
    const webhookSecret = env_1.env.RAZORPAY_WEBHOOK_SECRET || "";
    // Step 1: Validate the webhook signature
    const shasum = crypto_1.default.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");
    if (digest !== signature) {
        logger_1.default.error("Webhook Error: Invalid signature");
        return res.status(400).send("Invalid signature");
    }
    // Step 2: Handle the event
    const event = req.body;
    if (event.event === "order.paid") {
        const order = event.payload.order.entity;
        const payment = event.payload.payment.entity;
        logger_1.default.info(`Webhook received: order.paid for order ${order.id}`);
        const userId = order.notes?.userId;
        const planId = order.notes?.planId;
        const paymentId = payment.id;
        const orderId = order.id;
        if (userId && planId) {
            try {
                await activateSubscription(userId, Number(planId), paymentId, orderId);
                logger_1.default.info(`Subscription activated for user ${userId} via webhook.`);
            }
            catch (dbError) {
                logger_1.default.error(`Error activating subscription for user ${userId} from webhook:`, dbError);
                // Return a 500 to let Razorpay know it failed and should retry (if configured)
                return res.status(500).send("Error processing subscription");
            }
        }
        else {
            logger_1.default.warn("Missing metadata in order.paid event:", order.notes);
        }
    }
    else {
        logger_1.default.info(`Unhandled Razorpay event type: ${event.event}`);
    }
    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
};
exports.handleRazorpayWebhook = handleRazorpayWebhook;
//# sourceMappingURL=razorWebhook.controller.js.map