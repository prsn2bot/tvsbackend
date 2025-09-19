-- Migration: Add OCR metadata columns to documents table
-- This migration adds comprehensive OCR tracking fields to support the new OCR fallback system

-- Add OCR metadata columns to documents table
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS ocr_method_used VARCHAR(50),
ADD COLUMN IF NOT EXISTS ocr_confidence DECIMAL(3,2) CHECK (ocr_confidence >= 0 AND ocr_confidence <= 1),
ADD COLUMN IF NOT EXISTS ocr_processing_time INTEGER CHECK (ocr_processing_time >= 0),
ADD COLUMN IF NOT EXISTS ocr_retry_count INTEGER DEFAULT 0 CHECK (ocr_retry_count >= 0),
ADD COLUMN IF NOT EXISTS ocr_error_details TEXT,
ADD COLUMN IF NOT EXISTS ocr_last_attempt TIMESTAMP;

-- Add comments for documentation
COMMENT ON COLUMN documents.ocr_method_used IS 'OCR method used for text extraction (pdf-extraction, tesseract-ocr, cloudinary-fallback)';
COMMENT ON COLUMN documents.ocr_confidence IS 'Confidence score of OCR extraction (0.0 to 1.0)';
COMMENT ON COLUMN documents.ocr_processing_time IS 'Time taken for OCR processing in milliseconds';
COMMENT ON COLUMN documents.ocr_retry_count IS 'Number of OCR retry attempts made';
COMMENT ON COLUMN documents.ocr_error_details IS 'Details of any OCR processing errors';
COMMENT ON COLUMN documents.ocr_last_attempt IS 'Timestamp of the last OCR processing attempt';

-- Create index for OCR method queries
CREATE INDEX IF NOT EXISTS idx_documents_ocr_method ON documents(ocr_method_used);

-- Create index for OCR status and method combination
CREATE INDEX IF NOT EXISTS idx_documents_ocr_status_method ON documents(ocr_status, ocr_method_used);

-- Create index for OCR confidence queries
CREATE INDEX IF NOT EXISTS idx_documents_ocr_confidence ON documents(ocr_confidence) WHERE ocr_confidence IS NOT NULL;

-- Create index for OCR processing time analysis
CREATE INDEX IF NOT EXISTS idx_documents_ocr_processing_time ON documents(ocr_processing_time) WHERE ocr_processing_time IS NOT NULL;

-- Update existing documents with default values where appropriate
UPDATE documents 
SET ocr_retry_count = 0 
WHERE ocr_retry_count IS NULL;

-- Add constraint to ensure ocr_method_used contains valid values
ALTER TABLE documents 
ADD CONSTRAINT chk_ocr_method_valid 
CHECK (ocr_method_used IS NULL OR ocr_method_used IN ('pdf-extraction', 'tesseract-ocr', 'cloudinary-fallback'));

-- Create a view for OCR analytics
CREATE OR REPLACE VIEW ocr_processing_stats AS
SELECT 
    ocr_method_used,
    ocr_status,
    COUNT(*) as document_count,
    AVG(ocr_confidence) as avg_confidence,
    AVG(ocr_processing_time) as avg_processing_time,
    MAX(ocr_processing_time) as max_processing_time,
    MIN(ocr_processing_time) as min_processing_time,
    SUM(CASE WHEN ocr_retry_count > 0 THEN 1 ELSE 0 END) as documents_with_retries,
    AVG(ocr_retry_count) as avg_retry_count
FROM documents 
WHERE ocr_method_used IS NOT NULL
GROUP BY ocr_method_used, ocr_status;

COMMENT ON VIEW ocr_processing_stats IS 'Analytics view for OCR processing performance and statistics';