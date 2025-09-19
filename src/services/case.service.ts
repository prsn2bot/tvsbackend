import { CaseModel } from "../models/case.model";
import { addAiProcessingJob } from "../jobs/queue";

export class CaseService {
  static async createCase(
    userId: number,
    caseData: { title: string; description: string; status: string }
  ) {
    const caseRecord = await CaseModel.create({
      ...caseData,
      officer_user_id: userId,
    });
    return caseRecord;
  }

  static async getCases(
    userId: number,
    filters: { status?: string; min_created_at?: string; q?: string },
    pagination: { page: number; limit: number }
  ) {
    const cases = await CaseModel.findCasesByUser(userId, filters, pagination);
    return cases;
  }

  static async getCaseById(caseId: number, userId: number) {
    const caseData = await CaseModel.findById(caseId);
    if (!caseData || caseData.officer_user_id !== userId) {
      throw new Error("Case not found or access denied");
    }
    return caseData;
  }

  static async addDocument(
    caseId: number,
    userId: number,
    documentData: {
      cloudinary_public_id: string;
      secure_url: string;
      ocr_text?: string;
    }
  ) {
    // Verify case ownership
    await this.getCaseById(caseId, userId);
    const document = await CaseModel.createDocument({
      ...documentData,
      case_id: caseId,
    });

    // Enqueue AI processing job
    await addAiProcessingJob({ documentId: document.id });

    return document;
  }

  static async submitReview(
    caseId: number,
    reviewerId: number,
    reviewData: { review_text: string; decision: string }
  ) {
    // Verify case exists
    const caseData = await CaseModel.findById(caseId);
    if (!caseData) {
      throw new Error("Case not found");
    }
    const review = await CaseModel.createReview({
      ...reviewData,
      case_id: caseId,
      reviewer_id: reviewerId,
    });
    return review;
  }

  static async getCasesForAdmin(
    filters: { status?: string; min_created_at?: string; q?: string },
    pagination: { limit: number; offset: number }
  ) {
    const cases = await CaseModel.findAll(filters, pagination);
    return cases;
  }
}
