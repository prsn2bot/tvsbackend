"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rateLimitMiddleware_1 = __importDefault(require("../../middleware/rateLimitMiddleware"));
const subscriptionFeature_middleware_1 = __importDefault(require("../../middleware/subscriptionFeature.middleware"));
const validation_middleware_1 = require("../../middleware/validation.middleware");
const case_controller_1 = require("../../controllers/v1/case.controller");
const case_dto_1 = require("../../dto/case.dto");
const router = express_1.default.Router();
// POST / - Create a new case
router.post("/", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["officer", "owner"]), (0, rateLimitMiddleware_1.default)(), subscriptionFeature_middleware_1.default, (0, validation_middleware_1.validateBody)(case_dto_1.CreateCaseDto, "case"), case_controller_1.CaseController.createCase);
// GET / - Get my cases with filters
router.get("/", auth_middleware_1.authenticate, (0, rateLimitMiddleware_1.default)(), subscriptionFeature_middleware_1.default, (0, validation_middleware_1.validateQuery)(case_dto_1.CaseQueryDto, "case"), case_controller_1.CaseController.getCases);
// GET /assigned - Get cases assigned to current user
router.get("/assigned", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["cvo", "legal_board"]), (0, rateLimitMiddleware_1.default)(), 
// subscriptionFeatureMiddleware,
case_controller_1.CaseController.getCasesAssignedToUser);
// GET /:caseId - Get a specific case
router.get("/:caseId", auth_middleware_1.authenticate, (0, rateLimitMiddleware_1.default)(), subscriptionFeature_middleware_1.default, (0, validation_middleware_1.validateParams)(case_dto_1.CaseParamsDto, "case"), case_controller_1.CaseController.getCaseById);
// POST /:caseId/documents - Add a document to a case
router.post("/:caseId/documents", auth_middleware_1.authenticate, (0, rateLimitMiddleware_1.default)(), subscriptionFeature_middleware_1.default, (0, validation_middleware_1.validateAll)(case_dto_1.AddDocumentDto, undefined, case_dto_1.CaseParamsDto, "case"), case_controller_1.CaseController.addDocument);
// POST /:caseId/review - Submit a review
router.post("/:caseId/review", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["cvo", "legal_board", "owner"]), (0, rateLimitMiddleware_1.default)(), 
// subscriptionFeatureMiddleware,
(0, validation_middleware_1.validateAll)(case_dto_1.SubmitReviewDto, undefined, case_dto_1.CaseParamsDto, "case"), case_controller_1.CaseController.submitReview);
// GET /:caseId/documents - Get case documents for review
router.get("/:caseId/documents", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["cvo", "legal_board", "owner"]), (0, rateLimitMiddleware_1.default)(), 
// subscriptionFeatureMiddleware,
(0, validation_middleware_1.validateParams)(case_dto_1.CaseParamsDto, "case"), case_controller_1.CaseController.getCaseDocumentsForReview);
// POST /:caseId/assign-cvo - Assign case to CVO (admin only)
router.post("/:caseId/assign-cvo", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin", "owner"]), (0, rateLimitMiddleware_1.default)(), 
// subscriptionFeatureMiddleware,
(0, validation_middleware_1.validateParams)(case_dto_1.CaseParamsDto, "case"), case_controller_1.CaseController.assignCaseToCVO);
// POST /:caseId/assign-legal-board - Assign case to legal board (admin only)
router.post("/:caseId/assign-legal-board", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin", "owner"]), (0, rateLimitMiddleware_1.default)(), 
// subscriptionFeatureMiddleware,
(0, validation_middleware_1.validateParams)(case_dto_1.CaseParamsDto, "case"), case_controller_1.CaseController.assignCaseToLegalBoard);
// PUT /:caseId/status - Update case status
router.put("/:caseId/status", auth_middleware_1.authenticate, (0, rateLimitMiddleware_1.default)(), subscriptionFeature_middleware_1.default, (0, validation_middleware_1.validateParams)(case_dto_1.CaseParamsDto, "case"), case_controller_1.CaseController.updateCaseStatus);
exports.default = router;
//# sourceMappingURL=case.route.js.map