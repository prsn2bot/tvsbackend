-- Migration: Fix OCR method constraint to allow additional values
-- This migration updates the constraint to allow the values being used by the OCR system

-- Drop the existing constraint
ALTER TABLE documents DROP CONSTRAINT IF EXISTS chk_ocr_method_valid;

-- Add updated constraint with additional allowed values
ALTER TABLE documents 
ADD CONSTRAINT chk_ocr_method_valid 
CHECK (ocr_method_used IS NULL OR ocr_method_used IN (
  'pdf-extraction', 
  'tesseract-ocr', 
  'cloudinary-fallback',
  'auto-detect',
  'orchestrator-fallback',
  'ai-processing-error'
));