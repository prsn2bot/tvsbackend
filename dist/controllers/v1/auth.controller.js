"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../../services/auth.service");
const errorHandler_middleware_1 = require("../../middleware/errorHandler.middleware");
class AuthController {
}
exports.AuthController = AuthController;
_a = AuthController;
AuthController.register = (0, errorHandler_middleware_1.asyncHandler)(async (req, res, next) => {
    const { email, password, role } = req.body;
    const user = await auth_service_1.AuthService.register(email, password, role);
    res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: { user },
    });
});
AuthController.login = (0, errorHandler_middleware_1.asyncHandler)(async (req, res, next) => {
    const { email, password } = req.body;
    const tokens = await auth_service_1.AuthService.login(email, password);
    res.json({
        success: true,
        message: "Login successful",
        data: tokens,
    });
});
AuthController.refreshToken = (0, errorHandler_middleware_1.asyncHandler)(async (req, res, next) => {
    const { refreshToken } = req.body;
    const tokens = await auth_service_1.AuthService.refreshToken(refreshToken);
    res.json({
        success: true,
        message: "Token refreshed successfully",
        data: tokens,
    });
});
//# sourceMappingURL=auth.controller.js.map