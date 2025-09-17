"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const razorWebhook_controller_1 = require("../../controllers/v1/razorWebhook.controller");
const router = express_1.default.Router();
router.post("/", razorWebhook_controller_1.handleRazorpayWebhook);
exports.default = router;
//# sourceMappingURL=razorWebhook.route.js.map