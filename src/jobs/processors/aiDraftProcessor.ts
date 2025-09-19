import { Job } from "bullmq";
import { AiDraftModel } from "../../models/aiDraft.model";
import { AppError } from "../../utils/AppError";
import { ocrOrchestrator } from "../../services/ocr";
import { ocrMetadataService } from "../../services/ocr/ocrMetadata.service";
import {
  generateDraftWithAI,
  createVectorEmbedding,
} from "../../services/ai.service";
import logger from "../../utils/logger";
import { AiProcessingJobData } from "../queue";
import { CaseModel } from "../../models/case.model";

/**
 * The main processor function for handling AI draft generation.
 * This function is executed by a background worker for each job.
 */
const aiDraftProcessor = async (job: Job<AiProcessingJobData>) => {
  const { documentId } = job.data;
  logger.info(`Processing AI job for document ID: ${documentId}`);

  try {
    // 1. Fetch document metadata from our database
    const document = await CaseModel.findDocumentById(documentId);
    if (!document) {
      throw new AppError(`Document with ID ${documentId} not found.`, 404);
    }

    logger.info(`Found document for case ID: ${document.case_id}`);

    // 2. Get the document's text using enhanced OCR service
    logger.info(
      `Starting OCR processing for document ${documentId} (Cloudinary ID: ${document.cloudinary_public_id})`
    );

    // Mark document as OCR pending
    await ocrMetadataService.markDocumentOcrPending(
      documentId,
      "pdf-extraction"
    );

    let ocrText: string;
    let retryCount = 0;

    try {
      // Use the new OCR orchestrator with fallback capabilities
      const ocrResult = await ocrOrchestrator.extractText(
        document.cloudinary_public_id,
        {
          enablePdfExtraction: true,
          enableTesseractOcr: true,
          enableCloudinaryFallback: true,
          timeout: 60000, // 1 minute timeout
          retryAttempts: 2,
        }
      );

      ocrText = ocrResult.text;

      // Update document with comprehensive OCR metadata
      await ocrMetadataService.updateDocumentWithOcrResult(
        documentId,
        ocrResult,
        retryCount
      );

      logger.info(`OCR processing completed for document ${documentId}`, {
        method: ocrResult.method,
        confidence: ocrResult.confidence,
        textLength: ocrText.length,
        processingTime: ocrResult.processingTime,
      });
    } catch (ocrError) {
      // Handle OCR failure with detailed error tracking
      const errorMessage =
        ocrError instanceof Error ? ocrError.message : "Unknown OCR error";

      logger.error(`OCR processing failed for document ${documentId}:`, {
        error: errorMessage,
        cloudinaryId: document.cloudinary_public_id,
      });

      // Update document with failure information
      await ocrMetadataService.updateDocumentWithOcrFailure(
        documentId,
        "cloudinary-fallback",
        errorMessage,
        retryCount
      );

      // For backward compatibility, still try to get some text
      // This ensures the AI processing can continue even if OCR fails
      ocrText = `[OCR Processing Failed: ${errorMessage}]`;

      // Update with minimal text to allow processing to continue
      await CaseModel.updateDocument(documentId, {
        ocr_text: ocrText,
        ocr_status: "failed",
      });
    }

    // 3. Create the vector embedding for the document text
    logger.info(`Creating vector embedding for document ${documentId}`);
    const vectorEmbedding = await createVectorEmbedding(ocrText);

    // Update document with vector embedding
    await CaseModel.updateDocument(documentId, {
      vector_embedding: vectorEmbedding,
    });
    logger.info(
      `Vector embedding created and saved for document ${documentId}`
    );

    // 4. Send the extracted text to the AI service to generate a draft
    logger.info(`Generating AI draft for document ${documentId}`);
    const aiResult = await generateDraftWithAI(ocrText);

    // 5. Save the new AI draft to the database
    logger.info(`Saving AI draft for case ${document.case_id}`);
    await AiDraftModel.createAiDraft({
      case_id: document.case_id,
      version: 1, // You could add logic to determine the next version number
      content: aiResult.draftContent,
      defence_score: aiResult.defenceScore,
      confidence_score: aiResult.confidenceScore,
    });

    // 6. Update the case status to notify the user
    logger.info(
      `Updating case ${document.case_id} status to awaiting_officer_review`
    );
    await CaseModel.updateCaseStatus(
      document.case_id,
      "awaiting_officer_review"
    );

    logger.info(`Successfully processed AI job for document ID: ${documentId}`);
  } catch (error: any) {
    logger.error(
      `Failed to process AI job for document ${documentId}:`,
      error.message
    );
    // Update document status to failed if possible
    try {
      const errorMessage =
        error instanceof Error ? error.message : "AI processing failed";
      await ocrMetadataService.updateDocumentWithOcrFailure(
        documentId,
        "cloudinary-fallback",
        errorMessage
      );
    } catch (updateError) {
      logger.error(`Failed to update document status to failed:`, updateError);
    }
    throw error;
  }
};

export default aiDraftProcessor;
