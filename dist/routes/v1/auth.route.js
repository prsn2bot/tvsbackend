"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const rateLimitMiddleware_1 = __importDefault(require("../../middleware/rateLimitMiddleware"));
const validation_middleware_1 = require("../../middleware/validation.middleware");
const auth_controller_1 = require("../../controllers/v1/auth.controller");
const auth_dto_1 = require("../../dto/auth.dto");
const router = express_1.default.Router();
// POST /register - Register new user
router.post("/register", (0, rateLimitMiddleware_1.default)(), (0, validation_middleware_1.validateBody)(auth_dto_1.RegisterDto), auth_controller_1.AuthController.register);
// POST /login - Login user
router.post("/login", (0, rateLimitMiddleware_1.default)(), (0, validation_middleware_1.validateBody)(auth_dto_1.LoginDto), auth_controller_1.AuthController.login);
// POST /refresh-token - Refresh access token
router.post("/refresh-token", (0, rateLimitMiddleware_1.default)(), (0, validation_middleware_1.validateBody)(auth_dto_1.RefreshTokenDto), auth_controller_1.AuthController.refreshToken);
exports.default = router;
//# sourceMappingURL=auth.route.js.map