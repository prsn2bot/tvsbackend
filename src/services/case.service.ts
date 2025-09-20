import { CaseModel } from "../models/case.model";
import { addAiProcessingJob } from "../jobs/queue";
import { ErrorHelpers } from "../utils/errorHelpers";

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

  static async getCaseById(caseId: number, userId: number, userRole?: string) {
    if (!caseId) {
      throw ErrorHelpers.badRequest("Case ID is required");
    }

    const caseData = await CaseModel.findById(caseId);
    if (!caseData) {
      throw ErrorHelpers.notFound("Case");
    }

    // Role-based access control
    const hasAccess = this.checkCaseAccess(caseData, userId, userRole);
    if (!hasAccess) {
      throw ErrorHelpers.forbidden("Access denied to this case");
    }

    return caseData;
  }

  private static checkCaseAccess(
    caseData: any,
    userId: number,
    userRole?: string
  ): boolean {
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
      return (
        caseData.assigned_cvo_id === userId ||
        caseData.status === "awaiting_cvo_review"
      );
    }

    // Legal board members can access cases assigned to them or cases awaiting legal review
    if (userRole === "legal_board") {
      return (
        caseData.assigned_legal_board_id === userId ||
        caseData.status === "awaiting_legal_review"
      );
    }

    return false;
  }

  static async addDocument(
    caseId: number,
    userId: number,
    documentData: {
      cloudinary_public_id: string;
      secure_url: string;
      ocr_text?: string;
    },
    userRole?: string
  ) {
    // Verify case access
    await this.getCaseById(caseId, userId, userRole);
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
    if (!caseId || !reviewerId) {
      throw ErrorHelpers.badRequest("Case ID and reviewer ID are required");
    }

    if (!reviewData.review_text || !reviewData.decision) {
      throw ErrorHelpers.missingFields(["review_text", "decision"]);
    }

    // Verify case exists
    const caseData = await CaseModel.findById(caseId);
    if (!caseData) {
      throw ErrorHelpers.notFound("Case");
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

  static async getCaseDocumentsForReview(
    caseId: number,
    userId: number,
    userRole?: string
  ) {
    if (!caseId) {
      throw ErrorHelpers.badRequest("Case ID is required");
    }

    const caseData = await CaseModel.findById(caseId);
    if (!caseData) {
      throw ErrorHelpers.notFound("Case");
    }

    // Check if user has access to this case for review
    const hasAccess = this.checkCaseAccess(caseData, userId, userRole);
    if (!hasAccess) {
      throw ErrorHelpers.forbidden("Access denied to case documents");
    }

    // Get documents for this case
    const documents = await CaseModel.findDocumentsByCaseId(caseId);
    return documents;
  }

  static async assignCaseToCVO(caseId: number, cvoId: number, adminId: number) {
    if (!caseId || !cvoId || !adminId) {
      throw ErrorHelpers.missingFields(["caseId", "cvoId", "adminId"]);
    }

    // Verify admin access
    const adminCaseData = await CaseModel.findById(caseId);
    if (!adminCaseData) {
      throw ErrorHelpers.notFound("Case");
    }

    // Only admin/owner can assign cases
    const hasAccess =
      this.checkCaseAccess(adminCaseData, adminId, "admin") ||
      this.checkCaseAccess(adminCaseData, adminId, "owner");
    if (!hasAccess) {
      throw ErrorHelpers.forbidden("Only admin/owner can assign cases");
    }

    const updatedCase = await CaseModel.assignCVO(caseId, cvoId);
    if (!updatedCase) {
      throw ErrorHelpers.internalError("Failed to assign case to CVO");
    }

    return updatedCase;
  }

  static async assignCaseToLegalBoard(
    caseId: number,
    legalBoardId: number,
    adminId: number
  ) {
    if (!caseId || !legalBoardId || !adminId) {
      throw ErrorHelpers.missingFields(["caseId", "legalBoardId", "adminId"]);
    }

    // Verify admin access
    const adminCaseData = await CaseModel.findById(caseId);
    if (!adminCaseData) {
      throw ErrorHelpers.notFound("Case");
    }

    // Only admin/owner can assign cases
    const hasAccess =
      this.checkCaseAccess(adminCaseData, adminId, "admin") ||
      this.checkCaseAccess(adminCaseData, adminId, "owner");
    if (!hasAccess) {
      throw ErrorHelpers.forbidden("Only admin/owner can assign cases");
    }

    const updatedCase = await CaseModel.assignLegalBoard(caseId, legalBoardId);
    if (!updatedCase) {
      throw ErrorHelpers.internalError("Failed to assign case to legal board");
    }

    return updatedCase;
  }

  static async getCasesAssignedToUser(userId: number, userRole: string) {
    if (!userId || !userRole) {
      throw ErrorHelpers.missingFields(["userId", "userRole"]);
    }

    if (userRole !== "cvo" && userRole !== "legal_board") {
      throw ErrorHelpers.forbidden(
        "Only CVO and legal board roles can have assigned cases"
      );
    }

    const cases = await CaseModel.findCasesByAssignedUser(userId, userRole);
    return cases;
  }

  static async updateCaseStatus(
    caseId: number,
    status: string,
    userId: number,
    userRole?: string
  ) {
    if (!caseId || !status || !userId) {
      throw ErrorHelpers.missingFields(["caseId", "status", "userId"]);
    }

    const validStatuses = [
      "draft",
      "submitted",
      "under_review",
      "awaiting_cvo_review",
      "awaiting_legal_review",
      "approved",
      "rejected",
    ];
    if (!validStatuses.includes(status)) {
      throw ErrorHelpers.invalidInput(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      );
    }

    const caseData = await CaseModel.findById(caseId);
    if (!caseData) {
      throw ErrorHelpers.notFound("Case");
    }

    // Check if user has access to this case
    const hasAccess = this.checkCaseAccess(caseData, userId, userRole);
    if (!hasAccess) {
      throw ErrorHelpers.forbidden("Access denied to update this case");
    }

    const updatedCase = await CaseModel.updateCaseStatus(caseId, status);
    if (!updatedCase) {
      throw ErrorHelpers.internalError("Failed to update case status");
    }

    return updatedCase;
  }
}
