"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const razorPayment_controller_1 = require("../../controllers/v1/razorPayment.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.post("/create-order", razorPayment_controller_1.createRazorpayOrder);
router.post("/verify-payment", razorPayment_controller_1.verifyPayment);
exports.default = router;
//# sourceMappingURL=razorPayment.route.js.map