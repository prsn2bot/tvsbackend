import { Request, Response, NextFunction } from "express";
import { SubscriptionService } from "../../services/subscription.service";
import {
  CreateSubscriptionDtoType,
  UpdateSubscriptionDtoType,
} from "../../dto/subscription.dto";

export class SubscriptionController {
  /**
   * Get user's active subscription
   */
  static async getSubscription(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const subscription = await SubscriptionService.getSubscriptionByUserId(
        userId
      );
      res.json({ subscription });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new subscription
   */
  static async createSubscription(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const subscriptionData: CreateSubscriptionDtoType = req.body;
      const subscription = await SubscriptionService.createSubscription(
        subscriptionData
      );
      res.status(201).json({ subscription });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an existing subscription
   */
  static async updateSubscription(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const subscriptionData: UpdateSubscriptionDtoType = req.body;

      // Convert id to number (validation middleware ensures it's valid)
      const numericId = parseInt(id, 10);

      const updatedSubscription = await SubscriptionService.updateSubscription(
        numericId,
        subscriptionData
      );

      if (!updatedSubscription) {
        res.status(404).json({ message: "Subscription not found" });
        return;
      }

      res.json({ subscription: updatedSubscription });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete/cancel a subscription
   */
  static async deleteSubscription(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params as { id: string };

      // Convert id to number (validation middleware ensures it's valid)
      const numericId = parseInt(id, 10);

      const deleted = await SubscriptionService.deleteSubscription(numericId);

      if (!deleted) {
        res.status(404).json({ message: "Subscription not found" });
        return;
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
