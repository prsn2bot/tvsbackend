"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aiDraft_model_1 = require("../../models/aiDraft.model");
const AppError_1 = require("../../utils/AppError");
const cloudinary_service_1 = require("../../services/cloudinary.service");
const ai_service_1 = require("../../services/ai.service");
const logger_1 = __importDefault(require("../../utils/logger"));
const case_model_1 = require("../../models/case.model");
/**
 * The main processor function for handling AI draft generation.
 * This function is executed by a background worker for each job.
 */
const aiDraftProcessor = async (job) => {
    const { documentId } = job.data;
    logger_1.default.info(`Processing AI job for document ID: ${documentId}`);
    try {
        // 1. Fetch document metadata from our database
        const document = await case_model_1.CaseModel.findDocumentById(documentId);
        if (!document) {
            throw new AppError_1.AppError(`Document with ID ${documentId} not found.`, 404);
        }
        logger_1.default.info(`Found document for case ID: ${document.case_id}`);
        // 2. Get the document's text using OCR service
        logger_1.default.info(`Extracting OCR text for Cloudinary ID: ${document.cloudinary_public_id}`);
        const ocrText = await (0, cloudinary_service_1.getOcrTextFromCloudinary)(document.cloudinary_public_id);
        // Update document with OCR text
        await case_model_1.CaseModel.updateDocument(documentId, {
            ocr_text: ocrText,
            ocr_status: "completed",
        });
        logger_1.default.info(`OCR text extracted and saved for document ${documentId}`);
        // 3. Create the vector embedding for the document text
        logger_1.default.info(`Creating vector embedding for document ${documentId}`);
        const vectorEmbedding = await (0, ai_service_1.createVectorEmbedding)(ocrText);
        // Update document with vector embedding
        await case_model_1.CaseModel.updateDocument(documentId, {
            vector_embedding: vectorEmbedding,
        });
        logger_1.default.info(`Vector embedding created and saved for document ${documentId}`);
        // 4. Send the extracted text to the AI service to generate a draft
        logger_1.default.info(`Generating AI draft for document ${documentId}`);
        const aiResult = await (0, ai_service_1.generateDraftWithAI)(ocrText);
        // 5. Save the new AI draft to the database
        logger_1.default.info(`Saving AI draft for case ${document.case_id}`);
        await aiDraft_model_1.AiDraftModel.createAiDraft({
            case_id: document.case_id,
            version: 1,
            content: aiResult.draftContent,
            defence_score: aiResult.defenceScore,
            confidence_score: aiResult.confidenceScore,
        });
        // 6. Update the case status to notify the user
        logger_1.default.info(`Updating case ${document.case_id} status to awaiting_officer_review`);
        await case_model_1.CaseModel.updateCaseStatus(document.case_id, "awaiting_officer_review");
        logger_1.default.info(`Successfully processed AI job for document ID: ${documentId}`);
    }
    catch (error) {
        logger_1.default.error(`Failed to process AI job for document ${documentId}:`, error.message);
        // Update document status to failed if possible
        try {
            await case_model_1.CaseModel.updateDocument(documentId, { ocr_status: "failed" });
        }
        catch (updateError) {
            logger_1.default.error(`Failed to update document status to failed:`, updateError);
        }
        throw error;
    }
};
exports.default = aiDraftProcessor;
//# sourceMappingURL=aiDraftProcessor.js.map