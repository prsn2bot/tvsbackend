import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import logger from "../../utils/logger";
import { env } from "../../config/env";
import { SubscriptionService } from "../../services/subscription.service";

// This function activates the subscription upon successful payment.
const activateSubscription = async (
  userId: string,
  planId: number,
  paymentId: string,
  orderId: string
) => {
  logger.info(`Activating subscription for user ${userId} with plan ${planId}`);
  try {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // Assuming monthly subscription

    const newSubscription = await SubscriptionService.createSubscription({
      user_id: parseInt(userId, 10),
      plan_id: planId,
      payment_provider_subscription_id: orderId,
      status: "active",
      start_date: startDate,
      end_date: endDate,
    });
    logger.info(
      `Subscription activated for user ${userId}. Subscription ID: ${newSubscription.id}`
    );
    return { success: true, subscription: newSubscription };
  } catch (error: any) {
    logger.error(
      `Error activating subscription for user ${userId}: ${error.message}`
    );
    throw new Error(`Failed to activate subscription: ${error.message}`);
  }
};

export const handleRazorpayWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const signature = req.headers["x-razorpay-signature"] as string;
  const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET || "";

  // Step 1: Validate the webhook signature
  const shasum = crypto.createHmac("sha256", webhookSecret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  if (digest !== signature) {
    logger.error("Webhook Error: Invalid signature");
    return res.status(400).send("Invalid signature");
  }

  // Step 2: Handle the event
  const event = req.body;

  if (event.event === "order.paid") {
    const order = event.payload.order.entity;
    const payment = event.payload.payment.entity;

    logger.info(`Webhook received: order.paid for order ${order.id}`);

    const userId = order.notes?.userId;
    const planId = order.notes?.planId;
    const paymentId = payment.id;
    const orderId = order.id;

    if (userId && planId) {
      try {
        await activateSubscription(userId, Number(planId), paymentId, orderId);
        logger.info(`Subscription activated for user ${userId} via webhook.`);
      } catch (dbError) {
        logger.error(
          `Error activating subscription for user ${userId} from webhook:`,
          dbError
        );
        // Return a 500 to let Razorpay know it failed and should retry (if configured)
        return res.status(500).send("Error processing subscription");
      }
    } else {
      logger.warn("Missing metadata in order.paid event:", order.notes);
    }
  } else {
    logger.info(`Unhandled Razorpay event type: ${event.event}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
};
