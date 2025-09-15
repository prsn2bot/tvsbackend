"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const rateLimitMiddleware_1 = __importDefault(require("../../middleware/rateLimitMiddleware"));
const auth_controller_1 = require("../../controllers/v1/auth.controller");
const router = express_1.default.Router();
// POST /register - Register new user
router.post("/register", (0, rateLimitMiddleware_1.default)(), auth_controller_1.AuthController.register);
// POST /login - Login user
router.post("/login", (0, rateLimitMiddleware_1.default)(), auth_controller_1.AuthController.login);
// POST /refresh-token - Refresh access token
router.post("/refresh-token", (0, rateLimitMiddleware_1.default)(), auth_controller_1.AuthController.refreshToken);
exports.default = router;
//# sourceMappingURL=auth.route.js.map