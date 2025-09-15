"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stripe_1 = __importDefault(require("stripe"));
const env_1 = require("./env");
const stripe = new stripe_1.default(env_1.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-05-28.basil',
});
exports.default = stripe;
//# sourceMappingURL=stripe.js.map