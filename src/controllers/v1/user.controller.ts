import { Request, Response, NextFunction } from "express";
import { UserService } from "../../services/user.service";
import { ApiResponse } from "../../types/common.types";
import { UserWithProfile } from "../../types/user.types";

export class UserController {
  static async getUserProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const userProfile = await UserService.getUserProfile(userId);
      if (!userProfile) {
        return res.status(404).json({ message: "User not found" });
      }
      const response: ApiResponse<UserWithProfile> = { data: userProfile };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async updateUserProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const profileData = req.body;
      await UserService.updateUserProfile(userId, profileData);
      res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
      next(error);
    }
  }
}
