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
    static async getCaseById(caseId, userId) {
        const caseData = await case_model_1.CaseModel.findById(caseId);
        if (!caseData || caseData.officer_user_id !== userId) {
            throw new Error("Case not found or access denied");
        }
        return caseData;
    }
    static async addDocument(caseId, userId, documentData) {
        // Verify case ownership
        await this.getCaseById(caseId, userId);
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
}
exports.CaseService = CaseService;
//# sourceMappingURL=case.service.js.map