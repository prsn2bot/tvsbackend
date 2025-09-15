import express from "express";
import { authenticate, hasRole } from "../../middleware/auth.middleware";
import rateLimitMiddleware from "../../middleware/rateLimitMiddleware";
import { SubscriptionService } from "../../services/subscription.service";

const router = express.Router();

// GET / - Get user's active subscription
router.get("/", authenticate, rateLimitMiddleware(), async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const subscription = await SubscriptionService.getSubscriptionByUserId(
      userId
    );
    res.json({ subscription });
  } catch (error) {
    next(error);
  }
});

// POST / - Create a subscription
router.post(
  "/",
  authenticate,
  hasRole(["admin"]),
  rateLimitMiddleware(),
  async (req, res, next) => {
    try {
      const subscriptionData = req.body;
      const subscription = await SubscriptionService.createSubscription(
        subscriptionData
      );
      res.status(201).json({ subscription });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /:id - Update a subscription
router.put(
  "/:id",
  authenticate,
  hasRole(["admin"]),
  rateLimitMiddleware(),
  async (req, res, next) => {
    try {
      const id = req.params.id;
      const subscriptionData = req.body;
      const updatedSubscription = await SubscriptionService.updateSubscription(
        id,
        subscriptionData
      );
      if (!updatedSubscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      res.json({ subscription: updatedSubscription });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /:id - Cancel a subscription
router.delete(
  "/:id",
  authenticate,
  hasRole(["admin"]),
  rateLimitMiddleware(),
  async (req, res, next) => {
    try {
      const id = req.params.id;
      const deleted = await SubscriptionService.deleteSubscription(id);
      if (!deleted) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
