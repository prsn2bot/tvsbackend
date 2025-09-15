import { UserModel } from "../models/user.model";
import { UserWithProfile, User } from "../types/user.types";
import { PaginatedResponse } from "../types/common.types";

export class UserService {
  static async getUserProfile(userId: string): Promise<UserWithProfile | null> {
    return await UserModel.findUserWithProfile(userId);
  }

  static async getUserByEmail(email: string): Promise<UserWithProfile | null> {
    return await UserModel.findUserByEmail(email);
  }

  static async updateUserProfile(
    userId: string,
    profileData: Partial<UserWithProfile>
  ): Promise<void> {
    // Note: For simplicity, assuming profileData only contains profile fields, not user fields
    await UserModel.updateProfile(userId, profileData);
  }

  static async getAllUsers(
    filters: { role?: string; account_status?: string },
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
    userId: string,
    accountStatus: string
  ): Promise<void> {
    await UserModel.updateUserStatus(userId, accountStatus);
  }
}
