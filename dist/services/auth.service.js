"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_model_1 = require("../models/auth.model");
class AuthService {
    static async register(email, password, role) {
        // TODO: Validate input, hash password, create user
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await auth_model_1.AuthModel.createUser({
            email,
            password_hash: hashedPassword,
            role: role,
        });
        return user;
    }
    static async login(email, password) {
        // TODO: Get user, verify password, generate tokens
        const user = await auth_model_1.AuthModel.getUserByEmail(email);
        if (!user)
            throw new Error("User not found");
        const isValid = await bcrypt_1.default.compare(password, user.password_hash);
        if (!isValid)
            throw new Error("Invalid password");
        const accessToken = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role, email: user.email }, "secret");
        const refreshToken = "refresh"; // TODO: Generate refresh token
        return { accessToken, refreshToken };
    }
    static async refreshToken(refreshToken) {
        // TODO: Verify refresh token, generate new access token
        return { accessToken: "newToken", refreshToken };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map