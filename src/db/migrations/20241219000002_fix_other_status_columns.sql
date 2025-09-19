-- Store the view definition first
-- We need to drop and recreate the ocr_processing_stats view because it depends on ocr_status column

-- Drop the view temporarily
DROP VIEW IF EXISTS ocr_processing_stats;

-- Update documents.ocr_status to use ocr_status enum
-- First, ensure all existing values are valid
UPDATE documents 
SET ocr_status = 'pending' 
WHERE ocr_status NOT IN ('pending', 'completed', 'failed');

-- Drop the default constraint first
ALTER TABLE documents 
ALTER COLUMN ocr_status DROP DEFAULT;

-- Then alter the column to use the enum
ALTER TABLE documents 
ALTER COLUMN ocr_status TYPE ocr_status 
USING ocr_status::ocr_status;

-- Re-add the default value using the enum
ALTER TABLE documents 
ALTER COLUMN ocr_status SET DEFAULT 'pending'::ocr_status;

-- Recreate the ocr_processing_stats view
CREATE VIEW ocr_processing_stats AS
SELECT 
    ocr_method_used,
    ocr_status,
    COUNT(*) as document_count,
    AVG(ocr_confidence) as avg_confidence,
    AVG(ocr_processing_time) as avg_processing_time,
    MAX(ocr_processing_time) as max_processing_time,
    MIN(ocr_processing_time) as min_processing_time,
    COUNT(*) FILTER (WHERE ocr_retry_count > 0) as documents_with_retries,
    AVG(ocr_retry_count) as avg_retry_count
FROM documents 
WHERE ocr_method_used IS NOT NULL
GROUP BY ocr_method_used, ocr_status;

-- Update reviews.status to use review_status enum  
-- First, ensure all existing values are valid
UPDATE reviews 
SET status = 'pending' 
WHERE status NOT IN ('pending', 'approved', 'rejected', 'escalated_to_legal');

-- Then alter the column to use the enum (no default to worry about here)
ALTER TABLE reviews 
ALTER COLUMN status TYPE review_status 
USING status::review_status;