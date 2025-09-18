"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../../services/user.service");
const errorHandler_middleware_1 = require("../../middleware/errorHandler.middleware");
const AppError_1 = require("../../utils/AppError");
class UserController {
}
exports.UserController = UserController;
_a = UserController;
UserController.getUserProfile = (0, errorHandler_middleware_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new AppError_1.AppError("Unauthorized", 401);
    }
    const userProfile = await user_service_1.UserService.getUserProfile(userId);
    if (!userProfile) {
        throw new AppError_1.AppError("User not found", 404);
    }
    res.status(200).json({
        success: true,
        message: "User profile retrieved successfully",
        data: userProfile,
    });
});
UserController.updateUserProfile = (0, errorHandler_middleware_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new AppError_1.AppError("Unauthorized", 401);
    }
    const profileData = req.body;
    await user_service_1.UserService.updateUserProfile(userId, profileData);
    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
    });
});
//# sourceMappingURL=user.controller.js.map