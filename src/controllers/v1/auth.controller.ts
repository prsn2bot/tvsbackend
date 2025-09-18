import { Request, Response, NextFunction } from "express";
import { AuthService } from "../../services/auth.service";
import { asyncHandler } from "../../middleware/errorHandler.middleware";
import {
  RegisterDtoType,
  LoginDtoType,
  RefreshTokenDtoType,
} from "../../dto/auth.dto";

export class AuthController {
  static register = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email, password, role } = req.body as RegisterDtoType;

      const user = await AuthService.register(email, password, role);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: { user },
      });
    }
  );

  static login = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email, password } = req.body as LoginDtoType;

      const tokens = await AuthService.login(email, password);

      res.json({
        success: true,
        message: "Login successful",
        data: tokens,
      });
    }
  );

  static refreshToken = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { refreshToken } = req.body as RefreshTokenDtoType;

      const tokens = await AuthService.refreshToken(refreshToken);

      res.json({
        success: true,
        message: "Token refreshed successfully",
        data: tokens,
      });
    }
  );
}
