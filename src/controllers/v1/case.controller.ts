import { Request, Response } from "express";
import { CaseService } from "../../services/case.service";

export class CaseController {
  static async createCase(req: Request, res: Response) {
    try {
      const { title, description, status } = req.body;
      const userId = req.user!.userId;
      const caseData = await CaseService.createCase(userId, {
        title,
        description,
        status,
      });
      res.status(201).json(caseData);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  static async getCases(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { page = 1, limit = 10, status, min_created_at } = req.query;
      const filters = {
        status: status as string,
        min_created_at: min_created_at as string,
      };
      const pagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      };
      const cases = await CaseService.getCases(userId, filters, pagination);
      res.json(cases);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  static async getCaseById(req: Request, res: Response) {
    try {
      const { caseId } = req.params;
      const userId = req.user!.userId;
      const caseData = await CaseService.getCaseById(caseId, userId);
      res.json(caseData);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  }

  static async addDocument(req: Request, res: Response) {
    try {
      const { caseId } = req.params;
      const { cloudinary_public_id, secure_url, ocr_text } = req.body;
      const userId = req.user!.userId;
      const document = await CaseService.addDocument(caseId, userId, {
        cloudinary_public_id,
        secure_url,
        ocr_text,
      });
      res.status(201).json(document);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  static async submitReview(req: Request, res: Response) {
    try {
      const { caseId } = req.params;
      const { review_text, decision } = req.body;
      const reviewerId = req.user!.userId;
      const review = await CaseService.submitReview(caseId, reviewerId, {
        review_text,
        decision,
      });
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}
