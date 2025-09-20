import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../types/user.types";
import { TokenResponse, JwtPayload } from "../types/auth.types";
import { AuthModel } from "../models/auth.model";
import { JWT_SECRET } from "../config/env";
import { ErrorHelpers } from "../utils/errorHelpers";

export class AuthService {
  static async register(
    email: string,
    password: string,
    role: string = "officer"
  ): Promise<User> {
    // Validate input
    if (!email || !password) {
      throw ErrorHelpers.missingFields(["email", "password"]);
    }
    if (!["officer", "cvo", "legal_board", "admin", "owner"].includes(role)) {
      throw ErrorHelpers.invalidInput("Invalid role");
    }
    // Check if user already exists
    const existingUser = await AuthModel.getUserByEmail(email);
    if (existingUser) {
      throw ErrorHelpers.userAlreadyExists();
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await AuthModel.createUser({
      email,
      password_hash: hashedPassword,
      role: role as any,
    });
    return user;
  }

  static async login(email: string, password: string): Promise<TokenResponse> {
    const user = await AuthModel.getUserByEmail(email);
    if (!user) throw ErrorHelpers.invalidCredentials();
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) throw ErrorHelpers.invalidCredentials();
    const accessToken = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        email: user.email,
        is_verified: user.account_status === "active",
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });
    return { accessToken, refreshToken };
  }

  static async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as JwtPayload;
      const user = await AuthModel.getUserByEmail(decoded.email);
      if (!user) throw ErrorHelpers.userNotFound();
      const accessToken = jwt.sign(
        {
          userId: user.id,
          role: user.role,
          email: user.email,
          is_verified: user.account_status === "active",
        },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
      const newRefreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      if (error instanceof Error && error.name === "JsonWebTokenError") {
        throw ErrorHelpers.invalidToken();
      }
      if (error instanceof Error && error.name === "TokenExpiredError") {
        throw ErrorHelpers.tokenExpired();
      }
      throw ErrorHelpers.invalidToken("Invalid refresh token");
    }
  }
}
