"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../../services/user.service");
class UserController {
    static async getUserProfile(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            const userProfile = await user_service_1.UserService.getUserProfile(userId);
            if (!userProfile) {
                return res.status(404).json({ message: "User not found" });
            }
            const response = { data: userProfile };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateUserProfile(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            const profileData = req.body;
            await user_service_1.UserService.updateUserProfile(userId, profileData);
            res.status(200).json({ message: "Profile updated successfully" });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map