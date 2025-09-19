// ENUMs matching the PostgreSQL types
export type CaseStatus =
  | "intake"
  | "ai_analysis"
  | "awaiting_officer_review"
  | "awaiting_cvo_review"
  | "awaiting_legal_review"
  | "finalized"
  | "archived";

export type ReviewType = "cvo" | "legal_board";

export type OcrStatus = "pending" | "completed" | "failed";

export type ReviewStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "escalated_to_legal";

export type UserRole = "officer" | "cvo" | "legal_board" | "admin" | "owner";

export type AccountStatus = "active" | "inactive" | "suspended";

// Represents the `cases` table
export interface Case {
  id: number; // SERIAL PRIMARY KEY (integer)
  officer_user_id: number; // INTEGER REFERENCES users(id)
  case_title: string;
  status: CaseStatus;
  assigned_cvo_id?: number; // INTEGER
  assigned_legal_board_id?: number; // INTEGER
  created_at: Date;
  updated_at: Date;
}

// Represents the `documents` table (using Cloudinary)
export interface Document {
  id: number; // SERIAL PRIMARY KEY (integer)
  case_id: number; // INTEGER REFERENCES cases(id)
  original_filename: string;
  cloudinary_public_id: string;
  secure_url: string;
  file_type?: string;
  file_size_bytes?: number;
  ocr_text?: string;
  ocr_status?: OcrStatus; // 'pending', 'completed', 'failed'
  ocr_method_used?: string; // OCR method used for extraction
  ocr_confidence?: number; // Confidence score (0.0 to 1.0)
  ocr_processing_time?: number; // Processing time in milliseconds
  ocr_retry_count?: number; // Number of retry attempts
  ocr_error_details?: string; // Error details if OCR failed
  ocr_last_attempt?: Date; // Timestamp of last OCR attempt
  vector_embedding?: number[];
  uploaded_at: Date;
}

// Represents the `ai_drafts` table
export interface AiDraft {
  id: number; // SERIAL PRIMARY KEY (integer)
  case_id: number; // INTEGER REFERENCES cases(id)
  version: number;
  content: string;
  defence_score?: number;
  confidence_score?: number;
  created_at: Date;
  updated_at?: Date;
}

// Represents the `reviews` table
export interface Review {
  id: number; // SERIAL PRIMARY KEY (integer)
  case_id: number; // INTEGER REFERENCES cases(id)
  reviewer_id: number; // INTEGER REFERENCES users(id)
  review_type: ReviewType;
  comments?: string;
  status: ReviewStatus;
  created_at: Date;
}

// AI Service related types
export interface AiResult {
  draftContent: string;
  defenceScore: number;
  confidenceScore: number;
}

// Job processing types
export interface AiProcessingJobData {
  documentId: number;
}

// Document creation input
export interface CreateDocumentInput {
  case_id: number;
  original_filename: string;
  cloudinary_public_id: string;
  secure_url: string;
  file_type?: string;
  file_size_bytes?: number;
}

// AI Draft creation input
export interface CreateAiDraftInput {
  case_id: number;
  version: number;
  content: string;
  defence_score?: number;
  confidence_score?: number;
}

// Case creation input
export interface CreateCaseInput {
  title: string;
  description: string;
  status: CaseStatus;
}

// Review creation input
export interface CreateReviewInput {
  case_id: number;
  reviewer_id: number;
  review_text: string;
  decision: ReviewStatus;
}
