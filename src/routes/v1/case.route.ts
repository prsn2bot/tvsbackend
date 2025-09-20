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

// GET /:caseId/documents - Get case documents for review
router.get(
  "/:caseId/documents",
  authenticate,
  hasRole(["cvo", "legal_board", "owner"]),
  rateLimitMiddleware(),
  subscriptionFeatureMiddleware,
  validateParams(CaseParamsDto, "case"),
  CaseController.getCaseDocumentsForReview
);

// POST /:caseId/assign-cvo - Assign case to CVO (admin only)
router.post(
  "/:caseId/assign-cvo",
  authenticate,
  hasRole(["admin", "owner"]),
  rateLimitMiddleware(),
  subscriptionFeatureMiddleware,
  validateParams(CaseParamsDto, "case"),
  CaseController.assignCaseToCVO
);

// POST /:caseId/assign-legal-board - Assign case to legal board (admin only)
router.post(
  "/:caseId/assign-legal-board",
  authenticate,
  hasRole(["admin", "owner"]),
  rateLimitMiddleware(),
  subscriptionFeatureMiddleware,
  validateParams(CaseParamsDto, "case"),
  CaseController.assignCaseToLegalBoard
);

// GET /assigned - Get cases assigned to current user
router.get(
  "/assigned",
  authenticate,
  hasRole(["cvo", "legal_board"]),
  rateLimitMiddleware(),
  subscriptionFeatureMiddleware,
  CaseController.getCasesAssignedToUser
);

// PUT /:caseId/status - Update case status
router.put(
  "/:caseId/status",
  authenticate,
  rateLimitMiddleware(),
  subscriptionFeatureMiddleware,
  validateParams(CaseParamsDto, "case"),
  CaseController.updateCaseStatus
);

export default router;
