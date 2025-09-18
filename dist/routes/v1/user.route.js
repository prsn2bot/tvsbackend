"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rateLimitMiddleware_1 = __importDefault(require("../../middleware/rateLimitMiddleware"));
const validation_middleware_1 = require("../../middleware/validation.middleware");
const user_controller_1 = require("../../controllers/v1/user.controller");
const user_dto_1 = require("../../dto/user.dto");
const router = express_1.default.Router();
// GET /me - Get my profile
router.get("/me", auth_middleware_1.authenticate, (0, rateLimitMiddleware_1.default)(), user_controller_1.UserController.getUserProfile);
// PUT /me - Update my profile
router.put("/me", auth_middleware_1.authenticate, (0, rateLimitMiddleware_1.default)(), (0, validation_middleware_1.validateBody)(user_dto_1.UpdateUserProfileDto), user_controller_1.UserController.updateUserProfile);
exports.default = router;
//# sourceMappingURL=user.route.js.map