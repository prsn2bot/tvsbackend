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

// Represents the `cases` table
export interface Case {
  id: string; // UUID
  officer_user_id: string; // UUID
  case_title: string;
  status: CaseStatus;
  assigned_cvo_id?: string; // UUID
  assigned_legal_board_id?: string; // UUID
  created_at: Date;
  updated_at: Date;
}

// Represents the `documents` table (using Cloudinary)
export interface Document {
  id: string; // UUID
  case_id: string; // UUID
  original_filename: string;
  cloudinary_public_id: string;
  secure_url: string;
  file_type?: string;
  file_size_bytes?: number;
  ocr_text?: string;
  vector_embedding?: number[];
  uploaded_at: Date;
}

// Represents the `ai_drafts` table
export interface AiDraft {
  id: string; // UUID
  case_id: string; // UUID
  version: number;
  content: string;
  defence_score?: number;
  confidence_score?: number;
  created_at: Date;
}

// Represents the `reviews` table
export interface Review {
  id: string; // UUID
  case_id: string; // UUID
  reviewer_id: string; // UUID
  review_type: ReviewType;
  comments?: string;
  status: string; // e.g., 'approved', 'escalated_to_legal'
  created_at: Date;
}
