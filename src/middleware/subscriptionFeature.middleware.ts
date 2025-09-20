import { Request, Response, NextFunction } from "express";
import { SubscriptionService } from "../services/subscription.service";

const subscriptionFeatureMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = req.user.userId;
    const userRole = req.user.role;

    // Bypass subscription check for admin and owner roles
    if (userRole === "admin" || userRole === "owner") {
      return next();
    }

    const subscription = await SubscriptionService.getSubscriptionByUserId(
      userId
    );

    if (!subscription || subscription.status !== "active") {
      return res.status(402).json({ message: "Active subscription required" });
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default subscriptionFeatureMiddleware;
