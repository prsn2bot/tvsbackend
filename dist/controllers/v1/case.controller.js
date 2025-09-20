"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaseController = void 0;
const case_service_1 = require("../../services/case.service");
const errorHandler_middleware_1 = require("../../middleware/errorHandler.middleware");
class CaseController {
}
exports.CaseController = CaseController;
_a = CaseController;
CaseController.createCase = (0, errorHandler_middleware_1.asyncHandler)(async (req, res, next) => {
    const { title, description, status } = req.body;
    const userId = req.user.userId;
    const caseData = await case_service_1.CaseService.createCase(userId, {
        title,
        description,
        status,
    });
    res.status(201).json({
        success: true,
        message: "Case created successfully",
        data: caseData,
    });
});
CaseController.getCases = (0, errorHandler_middleware_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user.userId;
    const { page = 1, limit = 10, status, min_created_at } = req.query;
    const filters = {
        status: status,
        min_created_at: min_created_at,
    };
    const pagination = {
        page: Number(page) || 1,
        limit: Number(limit) || 10,
    };
    const cases = await case_service_1.CaseService.getCases(userId, filters, pagination);
    res.json({
        success: true,
        message: "Cases retrieved successfully",
        data: cases,
    });
});
CaseController.getCaseById = (0, errorHandler_middleware_1.asyncHandler)(async (req, res, next) => {
    const caseId = Number(req.params.caseId);
    const userId = req.user.userId;
    const userRole = req.user.role; // Add this line
    const caseData = await case_service_1.CaseService.getCaseById(caseId, userId, userRole);
    res.json({
        success: true,
        message: "Case retrieved successfully",
        data: caseData,
    });
});
CaseController.addDocument = (0, errorHandler_middleware_1.asyncHandler)(async (req, res, next) => {
    const caseId = Number(req.params.caseId);
    const { cloudinary_public_id, secure_url, ocr_text } = req.body;
    const userId = req.user.userId;
    const document = await case_service_1.CaseService.addDocument(caseId, userId, {
        cloudinary_public_id,
        secure_url,
        ocr_text,
    });
    res.status(201).json({
        success: true,
        message: "Document added successfully",
        data: document,
    });
});
CaseController.submitReview = (0, errorHandler_middleware_1.asyncHandler)(async (req, res, next) => {
    const caseId = Number(req.params.caseId);
    const { review_text, decision } = req.body;
    const reviewerId = req.user.userId;
    const review = await case_service_1.CaseService.submitReview(caseId, reviewerId, {
        review_text,
        decision,
    });
    res.status(201).json({
        success: true,
        message: "Review submitted successfully",
        data: review,
    });
});
CaseController.getCaseDocumentsForReview = (0, errorHandler_middleware_1.asyncHandler)(async (req, res, next) => {
    const caseId = Number(req.params.caseId);
    const userId = req.user.userId;
    const userRole = req.user.role;
    const documents = await case_service_1.CaseService.getCaseDocumentsForReview(caseId, userId, userRole);
    res.json({
        success: true,
        message: "Case documents retrieved successfully",
        data: documents,
    });
});
CaseController.assignCaseToCVO = (0, errorHandler_middleware_1.asyncHandler)(async (req, res, next) => {
    const caseId = Number(req.params.caseId);
    const { cvo_id } = req.body;
    const adminId = req.user.userId;
    const updatedCase = await case_service_1.CaseService.assignCaseToCVO(caseId, cvo_id, adminId);
    res.json({
        success: true,
        message: "Case assigned to CVO successfully",
        data: updatedCase,
    });
});
CaseController.assignCaseToLegalBoard = (0, errorHandler_middleware_1.asyncHandler)(async (req, res, next) => {
    const caseId = Number(req.params.caseId);
    const { legal_board_id } = req.body;
    const adminId = req.user.userId;
    const updatedCase = await case_service_1.CaseService.assignCaseToLegalBoard(caseId, legal_board_id, adminId);
    res.json({
        success: true,
        message: "Case assigned to legal board successfully",
        data: updatedCase,
    });
});
CaseController.getCasesAssignedToUser = (0, errorHandler_middleware_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const cases = await case_service_1.CaseService.getCasesAssignedToUser(userId, userRole);
    res.json({
        success: true,
        message: "Assigned cases retrieved successfully",
        data: cases,
    });
});
CaseController.updateCaseStatus = (0, errorHandler_middleware_1.asyncHandler)(async (req, res, next) => {
    const caseId = Number(req.params.caseId);
    const { status } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;
    const updatedCase = await case_service_1.CaseService.updateCaseStatus(caseId, status, userId, userRole);
    res.json({
        success: true,
        message: "Case status updated successfully",
        data: updatedCase,
    });
});
//# sourceMappingURL=case.controller.js.map