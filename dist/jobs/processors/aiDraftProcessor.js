"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aiDraft_model_1 = require("../../models/aiDraft.model");
const AppError_1 = require("../../utils/AppError");
const ocr_1 = require("../../services/ocr");
const ocrMetadata_service_1 = require("../../services/ocr/ocrMetadata.service");
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
        // 2. Get the document's text using enhanced OCR service
        logger_1.default.info(`Starting OCR processing for document ${documentId} (Cloudinary ID: ${document.cloudinary_public_id})`);
        // Mark document as OCR pending
        await ocrMetadata_service_1.ocrMetadataService.markDocumentOcrPending(documentId, "pdf-extraction");
        let ocrText;
        let retryCount = 0;
        try {
            // Use the new OCR orchestrator with PDF extraction and Tesseract OCR only
            const ocrResult = await ocr_1.ocrOrchestrator.extractText(document.secure_url, // Use the actual Cloudinary URL instead of public ID
            {
                enablePdfExtraction: true,
                enableTesseractOcr: true,
                timeout: 60000,
                retryAttempts: 2,
            });
            ocrText = ocrResult.text;
            // Update document with comprehensive OCR metadata
            await ocrMetadata_service_1.ocrMetadataService.updateDocumentWithOcrResult(documentId, ocrResult, retryCount);
            logger_1.default.info(`OCR processing completed for document ${documentId}`, {
                method: ocrResult.method,
                confidence: ocrResult.confidence,
                textLength: ocrText.length,
                processingTime: ocrResult.processingTime,
            });
        }
        catch (ocrError) {
            // Handle OCR failure with detailed error tracking
            const errorMessage = ocrError instanceof Error ? ocrError.message : "Unknown OCR error";
            logger_1.default.error(`OCR processing failed for document ${documentId}:`, {
                error: errorMessage,
                cloudinaryId: document.cloudinary_public_id,
            });
            // Update document with failure information
            await ocrMetadata_service_1.ocrMetadataService.updateDocumentWithOcrFailure(documentId, "cloudinary-fallback", errorMessage, retryCount);
            // For backward compatibility, still try to get some text
            // This ensures the AI processing can continue even if OCR fails
            ocrText = `[OCR Processing Failed: ${errorMessage}]`;
            // Update with minimal text to allow processing to continue
            await case_model_1.CaseModel.updateDocument(documentId, {
                ocr_text: ocrText,
                ocr_status: "failed",
            });
        }
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
            const errorMessage = error instanceof Error ? error.message : "AI processing failed";
            await ocrMetadata_service_1.ocrMetadataService.updateDocumentWithOcrFailure(documentId, "cloudinary-fallback", errorMessage);
        }
        catch (updateError) {
            logger_1.default.error(`Failed to update document status to failed:`, updateError);
        }
        throw error;
    }
};
exports.default = aiDraftProcessor;
//# sourceMappingURL=aiDraftProcessor.js.map