import express from "express";

import { handleRazorpayWebhook } from "../../controllers/v1/razorWebhook.controller";

const router = express.Router();

router.post("/", handleRazorpayWebhook);

export default router;
