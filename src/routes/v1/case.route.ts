import express from "express";
import { authenticate, hasRole } from "../../middleware/auth.middleware";
import rateLimitMiddleware from "../../middleware/rateLimitMiddleware";
import subscriptionFeatureMiddleware from "../../middleware/subscriptionFeature.middleware";
import { CaseController } from "../../controllers/v1/case.controller";

const router = express.Router();

// POST / - Create a new case
router.post(
  "/",
  authenticate,
  hasRole(["officer"]),
  rateLimitMiddleware(),
  subscriptionFeatureMiddleware,
  CaseController.createCase
);

// GET / - Get my cases with filters
router.get(
  "/",
  authenticate,
  rateLimitMiddleware(),
  subscriptionFeatureMiddleware,
  CaseController.getCases
);

// GET /:caseId - Get a specific case
router.get(
  "/:caseId",
  authenticate,
  rateLimitMiddleware(),
  subscriptionFeatureMiddleware,
  CaseController.getCaseById
);

// POST /:caseId/documents - Add a document to a case
router.post(
  "/:caseId/documents",
  authenticate,
  rateLimitMiddleware(),
  subscriptionFeatureMiddleware,
  CaseController.addDocument
);

// POST /:caseId/review - Submit a review
router.post(
  "/:caseId/review",
  authenticate,
  hasRole(["cvo", "legal_board"]),
  rateLimitMiddleware(),
  subscriptionFeatureMiddleware,
  CaseController.submitReview
);

export default router;
