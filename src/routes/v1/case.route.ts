import express from "express";
import { authenticate, hasRole } from "../../middleware/auth.middleware";
import rateLimitMiddleware from "../../middleware/rateLimitMiddleware";
import subscriptionFeatureMiddleware from "../../middleware/subscriptionFeature.middleware";
import {
  validateBody,
  validateQuery,
  validateParams,
  validateAll,
} from "../../middleware/validation.middleware";
import { CaseController } from "../../controllers/v1/case.controller";
import {
  CreateCaseDto,
  AddDocumentDto,
  SubmitReviewDto,
  CaseQueryDto,
  CaseParamsDto,
} from "../../dto/case.dto";

const router = express.Router();

// POST / - Create a new case
router.post(
  "/",
  authenticate,
  hasRole(["officer", "owner"]),
  rateLimitMiddleware(),
  subscriptionFeatureMiddleware,
  validateBody(CreateCaseDto, "case"),
  CaseController.createCase
);

// GET / - Get my cases with filters
router.get(
  "/",
  authenticate,
  rateLimitMiddleware(),
  subscriptionFeatureMiddleware,
  validateQuery(CaseQueryDto, "case"),
  CaseController.getCases
);

// GET /:caseId - Get a specific case
router.get(
  "/:caseId",
  authenticate,
  rateLimitMiddleware(),
  subscriptionFeatureMiddleware,
  validateParams(CaseParamsDto, "case"),
  CaseController.getCaseById
);

// POST /:caseId/documents - Add a document to a case
router.post(
  "/:caseId/documents",
  authenticate,
  rateLimitMiddleware(),
  subscriptionFeatureMiddleware,
  validateAll(AddDocumentDto, undefined, CaseParamsDto, "case"),
  CaseController.addDocument
);

// POST /:caseId/review - Submit a review
router.post(
  "/:caseId/review",
  authenticate,
  hasRole(["cvo", "legal_board", "owner"]),
  rateLimitMiddleware(),
  subscriptionFeatureMiddleware,
  validateAll(SubmitReviewDto, undefined, CaseParamsDto, "case"),
  CaseController.submitReview
);

export default router;
