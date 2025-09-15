import { Request, Response } from "express";
import { AuthService } from "../../services/auth.service";

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, role = "officer" } = req.body;
      const user = await AuthService.register(email, password, role);
      res.status(201).json({ user });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const tokens = await AuthService.login(email, password);
      res.json(tokens);
    } catch (error) {
      res.status(401).json({ error: (error as Error).message });
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const tokens = await AuthService.refreshToken(refreshToken);
      res.json(tokens);
    } catch (error) {
      res.status(401).json({ error: (error as Error).message });
    }
  }
}
