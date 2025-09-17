"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = exports.createRazorpayOrder = void 0;
const crypto_1 = __importDefault(require("crypto"));
const razorpay_1 = __importDefault(require("../../config/razorpay"));
const plan_service_1 = require("../../services/plan.service");
const logger_1 = __importDefault(require("../../utils/logger"));
const env_1 = require("../../config/env");
/**
 * Creates a Razorpay Order.
 * The client will use the returned order_id to initiate the payment.
 */
const createRazorpayOrder = async (req, res, next) => {
    try {
        const { planId, userId } = req.body;
        if (!planId || !userId) {
            return res.status(400).json({ message: "Missing planId or userId" });
        }
        const plan = await plan_service_1.PlanService.getPlanById(planId);
        if (!plan) {
            return res.status(404).json({ message: "Plan not found" });
        }
        // Razorpay requires the amount in the smallest currency unit (e.g., paise for INR)
        const amountInPaise = Math.round(plan.price_monthly * 100);
        const options = {
            amount: amountInPaise,
            currency: "INR",
            receipt: `receipt_order_${new Date().getTime()}`,
            notes: {
                planId: planId.toString(),
                userId: userId,
                originalPriceINR: plan.price_monthly.toString(),
            },
        };
        logger_1.default.info(`Razorpay order creation: Plan ${planId}, Price: ${plan.price_monthly} INR -> ${amountInPaise} paise`);
        const order = await razorpay_1.default.orders.create(options);
        res.status(200).json(order);
    }
    catch (error) {
        logger_1.default.error("Error creating Razorpay order:", error);
        next(error);
    }
};
exports.createRazorpayOrder = createRazorpayOrder;
/**
 * Verifies the payment signature from the client.
 * This confirms that the payment was successful and securely handled.
 */
const verifyPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res
                .status(400)
                .json({ status: "error", message: "Missing payment details" });
        }
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto_1.default
            .createHmac("sha256", env_1.env.RAZORPAY_KEY_SECRET || "")
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
        }
        else {
            res.status(400).json({
                status: "error",
                message: "Invalid signature. Payment verification failed.",
            });
        }
    }
    catch (error) {
        logger_1.default.error("Error verifying payment:", error);
        next(error);
    }
};
exports.verifyPayment = verifyPayment;
//# sourceMappingURL=razorPayment.controller.js.map