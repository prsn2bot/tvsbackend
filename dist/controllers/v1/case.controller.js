"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaseController = void 0;
const case_service_1 = require("../../services/case.service");
class CaseController {
    static async createCase(req, res) {
        try {
            const { title, description, status } = req.body;
            const userId = req.user.userId;
            const caseData = await case_service_1.CaseService.createCase(userId, {
                title,
                description,
                status,
            });
            res.status(201).json(caseData);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    static async getCases(req, res) {
        try {
            const userId = req.user.userId;
            const { page = 1, limit = 10, status, min_created_at } = req.query;
            const filters = {
                status: status,
                min_created_at: min_created_at,
            };
            const pagination = {
                page: parseInt(page),
                limit: parseInt(limit),
            };
            const cases = await case_service_1.CaseService.getCases(userId, filters, pagination);
            res.json(cases);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    static async getCaseById(req, res) {
        try {
            const { caseId } = req.params;
            const userId = req.user.userId;
            // Convert caseId to number and validate
            const numericCaseId = parseInt(caseId, 10);
            if (isNaN(numericCaseId)) {
                return res.status(400).json({ error: "Invalid case ID format" });
            }
            const caseData = await case_service_1.CaseService.getCaseById(numericCaseId, userId);
            res.json(caseData);
        }
        catch (error) {
            res.status(404).json({ error: error.message });
        }
    }
    static async addDocument(req, res) {
        try {
            const { caseId } = req.params;
            const { cloudinary_public_id, secure_url, ocr_text } = req.body;
            const userId = req.user.userId;
            // Convert caseId to number and validate
            const numericCaseId = parseInt(caseId, 10);
            if (isNaN(numericCaseId)) {
                return res.status(400).json({ error: "Invalid case ID format" });
            }
            const document = await case_service_1.CaseService.addDocument(numericCaseId, userId, {
                cloudinary_public_id,
                secure_url,
                ocr_text,
            });
            res.status(201).json(document);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    static async submitReview(req, res) {
        try {
            const { caseId } = req.params;
            const { review_text, decision } = req.body;
            const reviewerId = req.user.userId;
            // Convert caseId to number and validate
            const numericCaseId = parseInt(caseId, 10);
            if (isNaN(numericCaseId)) {
                return res.status(400).json({ error: "Invalid case ID format" });
            }
            const review = await case_service_1.CaseService.submitReview(numericCaseId, reviewerId, {
                review_text,
                decision,
            });
            res.status(201).json(review);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.CaseController = CaseController;
//# sourceMappingURL=case.controller.js.map