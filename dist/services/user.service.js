"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_model_1 = require("../models/user.model");
class UserService {
    static async getUserProfile(userId) {
        return await user_model_1.UserModel.findUserWithProfile(userId);
    }
    static async updateUserProfile(userId, profileData) {
        // Note: For simplicity, assuming profileData only contains profile fields, not user fields
        await user_model_1.UserModel.updateProfile(userId, profileData);
    }
    static async getAllUsers(filters, pagination) {
        const offset = (pagination.page - 1) * pagination.limit;
        const users = await user_model_1.UserModel.findAll(filters, {
            limit: pagination.limit,
            offset,
        });
        const total = await user_model_1.UserModel.countAll(filters);
        return {
            data: users,
            pagination: {
                total,
                limit: pagination.limit,
                offset,
            },
        };
    }
    static async updateUserStatus(userId, accountStatus) {
        await user_model_1.UserModel.updateUserStatus(userId, accountStatus);
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map