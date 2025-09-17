import { Router } from "express";
import {
  createRazorpayOrder,
  verifyPayment,
} from "../../controllers/v1/razorPayment.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();
router.use(authenticate);

router.post("/create-order", createRazorpayOrder);
router.post("/verify-payment", verifyPayment);

export default router;
