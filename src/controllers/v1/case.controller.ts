import { Request, Response, NextFunction } from "express";
import { CaseService } from "../../services/case.service";
import { asyncHandler } from "../../middleware/errorHandler.middleware";

export class CaseController {
  static createCase = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { title, description, status } = req.body;
      const userId = req.user!.userId;

      const caseData = await CaseService.createCase(userId, {
        title,
        description,
        status,
      });

      res.status(201).json({
        success: true,
        message: "Case created successfully",
        data: caseData,
      });
    }
  );

  static getCases = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user!.userId;
      const { page = 1, limit = 10, status, min_created_at } = req.query;

      const filters = {
        status: status as string | undefined,
        min_created_at: min_created_at as string | undefined,
      };
      const pagination = {
        page: Number(page) || 1,
        limit: Number(limit) || 10,
      };

      const cases = await CaseService.getCases(userId, filters, pagination);

      res.json({
        success: true,
        message: "Cases retrieved successfully",
        data: cases,
      });
    }
  );

  static getCaseById = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const caseId = Number(req.params.caseId);
      const userId = req.user!.userId;

      const caseData = await CaseService.getCaseById(caseId, userId);

      res.json({
        success: true,
        message: "Case retrieved successfully",
        data: caseData,
      });
    }
  );

  static addDocument = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const caseId = Number(req.params.caseId);
      const { cloudinary_public_id, secure_url, ocr_text } = req.body;
      const userId = req.user!.userId;

      const document = await CaseService.addDocument(caseId, userId, {
        cloudinary_public_id,
        secure_url,
        ocr_text,
      });

      res.status(201).json({
        success: true,
        message: "Document added successfully",
        data: document,
      });
    }
  );

  static submitReview = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const caseId = Number(req.params.caseId);
      const { review_text, decision } = req.body;
      const reviewerId = req.user!.userId;

      const review = await CaseService.submitReview(caseId, reviewerId, {
        review_text,
        decision,
      });

      res.status(201).json({
        success: true,
        message: "Review submitted successfully",
        data: review,
      });
    }
  );
}
