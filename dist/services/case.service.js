"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaseService = void 0;
const case_model_1 = require("../models/case.model");
const queue_1 = require("../jobs/queue");
class CaseService {
    static async createCase(userId, caseData) {
        const caseRecord = await case_model_1.CaseModel.create({
            ...caseData,
            officer_user_id: userId,
        });
        return caseRecord;
    }
    static async getCases(userId, filters, pagination) {
        const cases = await case_model_1.CaseModel.findCasesByUser(userId, filters, pagination);
        return cases;
    }
    static async getCaseById(caseId, userId, userRole) {
        const caseData = await case_model_1.CaseModel.findById(caseId);
        if (!caseData) {
            throw new Error("Case not found");
        }
        // Role-based access control
        const hasAccess = this.checkCaseAccess(caseData, userId, userRole);
        if (!hasAccess) {
            throw new Error("Access denied");
        }
        return caseData;
    }
    static checkCaseAccess(caseData, userId, userRole) {
        // Admin and owner roles can access all cases
        if (userRole === "admin" || userRole === "owner") {
            return true;
        }
        // Case officers can access their own cases
        if (userRole === "officer" && caseData.officer_user_id === userId) {
            return true;
        }
        // CVOs can access cases assigned to them or cases awaiting CVO review
        if (userRole === "cvo") {
            return (caseData.assigned_cvo_id === userId ||
                caseData.status === "awaiting_cvo_review");
        }
        // Legal board members can access cases assigned to them or cases awaiting legal review
        if (userRole === "legal_board") {
            return (caseData.assigned_legal_board_id === userId ||
                caseData.status === "awaiting_legal_review");
        }
        return false;
    }
    static async addDocument(caseId, userId, documentData, userRole) {
        // Verify case access
        await this.getCaseById(caseId, userId, userRole);
        const document = await case_model_1.CaseModel.createDocument({
            ...documentData,
            case_id: caseId,
        });
        // Enqueue AI processing job
        await (0, queue_1.addAiProcessingJob)({ documentId: document.id });
        return document;
    }
    static async submitReview(caseId, reviewerId, reviewData) {
        // Verify case exists
        const caseData = await case_model_1.CaseModel.findById(caseId);
        if (!caseData) {
            throw new Error("Case not found");
        }
        const review = await case_model_1.CaseModel.createReview({
            ...reviewData,
            case_id: caseId,
            reviewer_id: reviewerId,
        });
        return review;
    }
    static async getCasesForAdmin(filters, pagination) {
        const cases = await case_model_1.CaseModel.findAll(filters, pagination);
        return cases;
    }
    static async getCaseDocumentsForReview(caseId, userId, userRole) {
        const caseData = await case_model_1.CaseModel.findById(caseId);
        if (!caseData) {
            throw new Error("Case not found");
        }
        // Check if user has access to this case for review
        const hasAccess = this.checkCaseAccess(caseData, userId, userRole);
        if (!hasAccess) {
            throw new Error("Access denied");
        }
        // Get documents for this case
        const documents = await case_model_1.CaseModel.findDocumentsByCaseId(caseId);
        return documents;
    }
    static async assignCaseToCVO(caseId, cvoId, adminId) {
        // Verify admin access
        const adminCaseData = await case_model_1.CaseModel.findById(caseId);
        if (!adminCaseData) {
            throw new Error("Case not found");
        }
        // Only admin/owner can assign cases
        const hasAccess = this.checkCaseAccess(adminCaseData, adminId, "admin") ||
            this.checkCaseAccess(adminCaseData, adminId, "owner");
        if (!hasAccess) {
            throw new Error("Access denied - only admin/owner can assign cases");
        }
        const updatedCase = await case_model_1.CaseModel.assignCVO(caseId, cvoId);
        if (!updatedCase) {
            throw new Error("Failed to assign case to CVO");
        }
        return updatedCase;
    }
    static async assignCaseToLegalBoard(caseId, legalBoardId, adminId) {
        // Verify admin access
        const adminCaseData = await case_model_1.CaseModel.findById(caseId);
        if (!adminCaseData) {
            throw new Error("Case not found");
        }
        // Only admin/owner can assign cases
        const hasAccess = this.checkCaseAccess(adminCaseData, adminId, "admin") ||
            this.checkCaseAccess(adminCaseData, adminId, "owner");
        if (!hasAccess) {
            throw new Error("Access denied - only admin/owner can assign cases");
        }
        const updatedCase = await case_model_1.CaseModel.assignLegalBoard(caseId, legalBoardId);
        if (!updatedCase) {
            throw new Error("Failed to assign case to legal board");
        }
        return updatedCase;
    }
    static async getCasesAssignedToUser(userId, userRole) {
        if (userRole !== "cvo" && userRole !== "legal_board") {
            throw new Error("Only CVO and legal board roles can have assigned cases");
        }
        const cases = await case_model_1.CaseModel.findCasesByAssignedUser(userId, userRole);
        return cases;
    }
    static async updateCaseStatus(caseId, status, userId, userRole) {
        const caseData = await case_model_1.CaseModel.findById(caseId);
        if (!caseData) {
            throw new Error("Case not found");
        }
        // Check if user has access to this case
        const hasAccess = this.checkCaseAccess(caseData, userId, userRole);
        if (!hasAccess) {
            throw new Error("Access denied");
        }
        const updatedCase = await case_model_1.CaseModel.updateCaseStatus(caseId, status);
        if (!updatedCase) {
            throw new Error("Failed to update case status");
        }
        return updatedCase;
    }
}
exports.CaseService = CaseService;
//# sourceMappingURL=case.service.js.map