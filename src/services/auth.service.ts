import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../types/user.types";
import { TokenResponse, JwtPayload } from "../types/auth.types";
import { AuthModel } from "../models/auth.model";
import { JWT_SECRET } from "../config/env";

export class AuthService {
  static async register(
    email: string,
    password: string,
    role: string = "officer"
  ): Promise<User> {
    // Validate input
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
    if (!["officer", "cvo", "legal_board", "admin", "owner"].includes(role)) {
      throw new Error("Invalid role");
    }
    // Check if user already exists
    const existingUser = await AuthModel.getUserByEmail(email);
    if (existingUser) {
      throw new Error("User already exists");
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
    if (!user) throw new Error("User not found");
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) throw new Error("Invalid password");
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
      if (!user) throw new Error("User not found");
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
      throw new Error("Invalid refresh token");
    }
  }
}
