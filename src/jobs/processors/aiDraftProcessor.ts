import { Job } from "bullmq";
import { AiDraftModel } from "../../models/aiDraft.model";
import { AppError } from "../../utils/AppError";
import { getOcrTextFromCloudinary } from "../../services/cloudinary.service";
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

    // 2. Get the document's text using OCR service
    logger.info(
      `Extracting OCR text for Cloudinary ID: ${document.cloudinary_public_id}`
    );
    const ocrText = await getOcrTextFromCloudinary(
      document.cloudinary_public_id
    );

    // Update document with OCR text
    await CaseModel.updateDocument(documentId, {
      ocr_text: ocrText,
      ocr_status: "completed",
    });
    logger.info(`OCR text extracted and saved for document ${documentId}`);

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
      await CaseModel.updateDocument(documentId, { ocr_status: "failed" });
    } catch (updateError) {
      logger.error(`Failed to update document status to failed:`, updateError);
    }
    throw error;
  }
};

export default aiDraftProcessor;
