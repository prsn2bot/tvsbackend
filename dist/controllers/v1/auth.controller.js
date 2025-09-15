"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../../services/auth.service");
class AuthController {
    static async register(req, res) {
        try {
            const { email, password, role } = req.body;
            const user = await auth_service_1.AuthService.register(email, password, role);
            res.status(201).json({ user });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const tokens = await auth_service_1.AuthService.login(email, password);
            res.json(tokens);
        }
        catch (error) {
            res.status(401).json({ error: error.message });
        }
    }
    static async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            const tokens = await auth_service_1.AuthService.refreshToken(refreshToken);
            res.json(tokens);
        }
        catch (error) {
            res.status(401).json({ error: error.message });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map