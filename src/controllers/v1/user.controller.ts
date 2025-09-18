import { Request, Response, NextFunction } from "express";
import { UserService } from "../../services/user.service";
import { asyncHandler } from "../../middleware/errorHandler.middleware";
import { UpdateUserProfileDtoType } from "../../dto/user.dto";
import { AppError } from "../../utils/AppError";

export class UserController {
  static getUserProfile = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError("Unauthorized", 401);
      }

      const userProfile = await UserService.getUserProfile(userId);
      if (!userProfile) {
        throw new AppError("User not found", 404);
      }

      res.status(200).json({
        success: true,
        message: "User profile retrieved successfully",
        data: userProfile,
      });
    }
  );

  static updateUserProfile = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError("Unauthorized", 401);
      }

      const profileData = req.body as UpdateUserProfileDtoType;
      await UserService.updateUserProfile(userId, profileData);

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
      });
    }
  );
}
