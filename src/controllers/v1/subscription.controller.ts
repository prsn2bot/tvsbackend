import { Request, Response, NextFunction } from "express";
import { SubscriptionService } from "../../services/subscription.service";
import {
  CreateSubscriptionDtoType,
  UpdateSubscriptionDtoType,
} from "../../dto/subscription.dto";
import { asyncHandler } from "../../middleware/errorHandler.middleware";

export class SubscriptionController {
  /**
   * Get user's active subscription
   */
  static getSubscription = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const subscription = await SubscriptionService.getSubscriptionByUserId(
      userId
    );

    res.json({
      success: true,
      message: "Subscription retrieved successfully",
      data: subscription,
    });
  });

  /**
   * Create a new subscription
   */
  static createSubscription = asyncHandler(
    async (req: Request, res: Response) => {
      const subscriptionData: CreateSubscriptionDtoType = req.body;
      const subscription = await SubscriptionService.createSubscription(
        subscriptionData
      );

      res.status(201).json({
        success: true,
        message: "Subscription created successfully",
        data: subscription,
      });
    }
  );

  /**
   * Update an existing subscription
   */
  static updateSubscription = asyncHandler(
    async (req: Request, res: Response) => {
      const { id } = req.params as { id: string };
      const subscriptionData: UpdateSubscriptionDtoType = req.body;

      // Convert id to number (validation middleware ensures it's valid)
      const numericId = parseInt(id, 10);

      const updatedSubscription = await SubscriptionService.updateSubscription(
        numericId,
        subscriptionData
      );

      res.json({
        success: true,
        message: "Subscription updated successfully",
        data: updatedSubscription,
      });
    }
  );

  /**
   * Delete/cancel a subscription
   */
  static deleteSubscription = asyncHandler(
    async (req: Request, res: Response) => {
      const { id } = req.params as { id: string };

      // Convert id to number (validation middleware ensures it's valid)
      const numericId = parseInt(id, 10);

      await SubscriptionService.deleteSubscription(numericId);

      res.status(204).send();
    }
  );
}
