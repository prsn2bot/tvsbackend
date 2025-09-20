import { UserModel } from "../models/user.model";
import { UserWithProfile, User } from "../types/user.types";
import { PaginatedResponse } from "../types/common.types";
import { ErrorHelpers } from "../utils/errorHelpers";

export class UserService {
  static async getUserProfile(userId: number): Promise<UserWithProfile> {
    const user = await UserModel.findUserWithProfile(userId);
    if (!user) {
      throw ErrorHelpers.userNotFound();
    }
    return user;
  }

  static async getUserByEmail(email: string): Promise<UserWithProfile> {
    if (!email) {
      throw ErrorHelpers.badRequest("Email is required");
    }
    const user = await UserModel.findUserByEmail(email);
    if (!user) {
      throw ErrorHelpers.userNotFound();
    }
    return user;
  }

  static async updateUserProfile(
    userId: number,
    profileData: Partial<UserWithProfile>
  ): Promise<void> {
    if (!userId) {
      throw ErrorHelpers.badRequest("User ID is required");
    }

    // Check if user exists first
    const existingUser = await UserModel.findUserWithProfile(userId);
    if (!existingUser) {
      throw ErrorHelpers.userNotFound();
    }

    // Note: For simplicity, assuming profileData only contains profile fields, not user fields
    await UserModel.updateProfile(userId, profileData);
  }

  static async getAllUsers(
    filters: { role?: string; account_status?: string; q?: string },
    pagination: { page: number; limit: number }
  ): Promise<PaginatedResponse<User>> {
    const offset = (pagination.page - 1) * pagination.limit;
    const users = await UserModel.findAll(filters, {
      limit: pagination.limit,
      offset,
    });
    const total = await UserModel.countAll(filters);
    return {
      data: users,
      pagination: {
        total,
        limit: pagination.limit,
        offset,
      },
    };
  }

  static async updateUserStatus(
    userId: number,
    accountStatus: string
  ): Promise<void> {
    if (!userId) {
      throw ErrorHelpers.badRequest("User ID is required");
    }

    const validStatuses = ["active", "inactive", "suspended", "pending"];
    if (!validStatuses.includes(accountStatus)) {
      throw ErrorHelpers.invalidInput(
        `Invalid account status. Must be one of: ${validStatuses.join(", ")}`
      );
    }

    // Check if user exists first
    const existingUser = await UserModel.findUserWithProfile(userId);
    if (!existingUser) {
      throw ErrorHelpers.userNotFound();
    }

    await UserModel.updateUserStatus(userId, accountStatus);
  }

  static async updateUserRole(userId: number, role: string): Promise<void> {
    if (!userId) {
      throw ErrorHelpers.badRequest("User ID is required");
    }

    const validRoles = ["officer", "cvo", "legal_board", "admin", "owner"];
    if (!validRoles.includes(role)) {
      throw ErrorHelpers.invalidInput(
        `Invalid role. Must be one of: ${validRoles.join(", ")}`
      );
    }

    // Check if user exists first
    const existingUser = await UserModel.findUserWithProfile(userId);
    if (!existingUser) {
      throw ErrorHelpers.userNotFound();
    }

    await UserModel.updateUserRole(userId, role);
  }
}
