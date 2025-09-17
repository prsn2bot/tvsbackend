import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import razorpay from "../../config/razorpay";
import { PlanService } from "../../services/plan.service";
import logger from "../../utils/logger";
import { env } from "../../config/env";

/**
 * Creates a Razorpay Order.
 * The client will use the returned order_id to initiate the payment.
 */
export const createRazorpayOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { planId, userId } = req.body;

    if (!planId || !userId) {
      return res.status(400).json({ message: "Missing planId or userId" });
    }

    const plan = await PlanService.getPlanById(planId);

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // Razorpay requires the amount in the smallest currency unit (e.g., paise for INR)
    const amountInPaise = Math.round(plan.price_monthly * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR", // Only INR is accepted
      receipt: `receipt_order_${new Date().getTime()}`,
      notes: {
        planId: planId.toString(),
        userId: userId,
        originalPriceINR: plan.price_monthly.toString(),
      },
    };

    logger.info(
      `Razorpay order creation: Plan ${planId}, Price: ${plan.price_monthly} INR -> ${amountInPaise} paise`
    );

    const order = await razorpay.orders.create(options);

    res.status(200).json(order);
  } catch (error: any) {
    logger.error("Error creating Razorpay order:", error);
    next(error);
  }
};

/**
 * Verifies the payment signature from the client.
 * This confirms that the payment was successful and securely handled.
 */
export const verifyPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ status: "error", message: "Missing payment details" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET || "")
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // Payment is legitimate. You can now confirm the order on the frontend.
      // The backend subscription activation will be handled by the webhook for reliability.
      res.status(200).json({
        status: "success",
        message: "Payment successful! Your transaction has been confirmed.",
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });
    } else {
      res.status(400).json({
        status: "error",
        message: "Invalid signature. Payment verification failed.",
      });
    }
  } catch (error: any) {
    logger.error("Error verifying payment:", error);
    next(error);
  }
};
