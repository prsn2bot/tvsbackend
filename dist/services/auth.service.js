"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_model_1 = require("../models/auth.model");
const env_1 = require("../config/env");
class AuthService {
    static async register(email, password, role = "officer") {
        // Validate input
        if (!email || !password) {
            throw new Error("Email and password are required");
        }
        if (!["officer", "cvo", "legal_board", "admin", "owner"].includes(role)) {
            throw new Error("Invalid role");
        }
        // Check if user already exists
        const existingUser = await auth_model_1.AuthModel.getUserByEmail(email);
        if (existingUser) {
            throw new Error("User already exists");
        }
        // Hash password
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await auth_model_1.AuthModel.createUser({
            email,
            password_hash: hashedPassword,
            role: role,
        });
        return user;
    }
    static async login(email, password) {
        const user = await auth_model_1.AuthModel.getUserByEmail(email);
        if (!user)
            throw new Error("User not found");
        const isValid = await bcrypt_1.default.compare(password, user.password_hash);
        if (!isValid)
            throw new Error("Invalid password");
        const accessToken = jsonwebtoken_1.default.sign({
            userId: user.id,
            role: user.role,
            email: user.email,
            is_verified: user.account_status === "active",
        }, env_1.JWT_SECRET, { expiresIn: "1h" });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id }, env_1.JWT_SECRET, {
            expiresIn: "7d",
        });
        return { accessToken, refreshToken };
    }
    static async refreshToken(refreshToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, env_1.JWT_SECRET);
            const user = await auth_model_1.AuthModel.getUserByEmail(decoded.email);
            if (!user)
                throw new Error("User not found");
            const accessToken = jsonwebtoken_1.default.sign({
                userId: user.id,
                role: user.role,
                email: user.email,
                is_verified: user.account_status === "active",
            }, env_1.JWT_SECRET, { expiresIn: "1h" });
            const newRefreshToken = jsonwebtoken_1.default.sign({ userId: user.id }, env_1.JWT_SECRET, {
                expiresIn: "7d",
            });
            return { accessToken, refreshToken: newRefreshToken };
        }
        catch (error) {
            throw new Error("Invalid refresh token");
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map