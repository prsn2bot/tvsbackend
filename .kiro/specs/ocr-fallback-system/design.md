# OCR Fallback System Design

## Overview

This design implements a robust OCR system that replaces the current mock Cloudinary OCR service with a multi-tier approach using PDF.js for PDF text extraction and Tesseract.js for image-based OCR. The system provides automatic fallback mechanisms to ensure reliable text extraction from various document types while maintaining the existing API interface.

## Architecture

### OCR Service Architecture

```
Document Processing Flow:
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Document      │───▶│  OCR Orchestrator │───▶│   Text Result   │
│   Upload        │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Method Selector │
                    └──────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
            ┌──────────────┐    ┌──────────────┐
            │   PDF.js     │    │ Tesseract.js │
            │  Extractor   │    │   OCR        │
            └──────────────┘    └──────────────┘
```

### Service Layer Structure

```
src/services/ocr/
├── ocrOrchestrator.service.ts    # Main OCR coordination
├── pdfExtractor.service.ts       # PDF.js text extraction
├── tesseractOcr.service.ts       # Tesseract.js OCR
├── ocrConfig.ts                  # Configuration management
└── types/
    └── ocr.types.ts              # OCR-related type definitions
```

## Components and Interfaces

### OCR Orchestrator Service

The main service that coordinates OCR operations and handles fallback logic.

```typescript
interface OcrResult {
  text: string;
  method: "pdf-extraction" | "tesseract-ocr" | "cloudinary-fallback";
  confidence?: number;
  processingTime: number;
  metadata?: {
    pageCount?: number;
    imageCount?: number;
    errors?: string[];
  };
}

interface OcrOptions {
  enablePdfExtraction: boolean;
  enableTesseractOcr: boolean;
  enableCloudinaryFallback: boolean;
  timeout: number;
  retryAttempts: number;
}
```

### PDF Extractor Service

Handles PDF text extraction using PDF.js library.

```typescript
interface PdfExtractionResult {
  text: string;
  pageCount: number;
  hasSelectableText: boolean;
  extractionMethod: "native-text" | "rendered-text";
}
```

### Tesseract OCR Service

Manages image-based OCR using Tesseract.js.

```typescript
interface TesseractOptions {
  language: string;
  engineMode: "OEM_LSTM_ONLY" | "OEM_TESSERACT_LSTM_COMBINED";
  pageSegMode: "PSM_AUTO" | "PSM_SINGLE_BLOCK" | "PSM_SINGLE_LINE";
}

interface TesseractResult {
  text: string;
  confidence: number;
  processingTime: number;
}
```

## Data Models

### Enhanced Document Model

The existing document model will be extended to track OCR processing details:

```typescript
interface DocumentOcrMetadata {
  ocr_method_used?: string;
  ocr_confidence?: number;
  ocr_processing_time?: number;
  ocr_retry_count?: number;
  ocr_error_details?: string;
  ocr_last_attempt?: Date;
}
```

### OCR Configuration Model

```typescript
interface OcrConfiguration {
  pdf_extraction_enabled: boolean;
  tesseract_enabled: boolean;
  cloudinary_fallback_enabled: boolean;
  default_timeout: number;
  max_retry_attempts: number;
  tesseract_language: string;
  tesseract_engine_mode: string;
  pdf_render_dpi: number;
}
```

## Error Handling

### Error Types and Recovery

1. **PDF Processing Errors**

   - Corrupted PDF files → Fall back to Tesseract OCR
   - Password-protected PDFs → Log error, attempt Tesseract on rendered pages
   - Unsupported PDF versions → Fall back to image conversion + Tesseract

2. **Tesseract OCR Errors**

   - Memory allocation failures → Reduce image resolution and retry
   - Language model not found → Fall back to English model
   - Timeout errors → Increase timeout for retry attempt

3. **Resource Management**
   - Memory cleanup after each OCR operation
   - Temporary file cleanup for image conversions
   - Process timeout handling with graceful termination

### Error Recovery Strategy

```typescript
interface OcrErrorRecovery {
  maxRetries: number;
  backoffStrategy: "linear" | "exponential";
  fallbackChain: OcrMethod[];
  timeoutHandling: {
    initialTimeout: number;
    maxTimeout: number;
    timeoutMultiplier: number;
  };
}
```

## Testing Strategy

### Unit Testing

1. **PDF Extractor Tests**

   - Test with various PDF types (text-based, image-based, mixed)
   - Test error handling for corrupted files
   - Test performance with large documents

2. **Tesseract OCR Tests**

   - Test with different image formats and qualities
   - Test language detection and processing
   - Test memory usage and cleanup

3. **OCR Orchestrator Tests**
   - Test fallback logic between methods
   - Test configuration changes
   - Test error propagation and recovery

### Integration Testing

1. **End-to-End Document Processing**

   - Upload various document types and verify text extraction
   - Test complete workflow from upload to AI processing
   - Verify database updates and status tracking

2. **Performance Testing**
   - Measure processing times for different document sizes
   - Test concurrent OCR operations
   - Memory usage monitoring during batch processing

### Test Data Requirements

- Sample PDFs: text-based, scanned, mixed content, corrupted
- Sample images: various formats (PNG, JPG, TIFF), different resolutions
- Edge cases: empty documents, non-text images, multilingual content

## Implementation Phases

### Phase 1: Core Infrastructure

- Set up OCR service structure and interfaces
- Implement basic PDF.js text extraction
- Create configuration management system

### Phase 2: Tesseract Integration

- Implement Tesseract.js OCR service
- Add image conversion utilities for PDFs
- Implement basic fallback logic

### Phase 3: Advanced Features

- Add confidence scoring and quality assessment
- Implement retry mechanisms and error recovery
- Add performance monitoring and logging

### Phase 4: Integration and Testing

- Replace existing OCR calls with new orchestrator
- Comprehensive testing and performance optimization
- Documentation and deployment preparation

## Configuration Management

### Environment Variables

```env
# OCR Configuration
OCR_PDF_EXTRACTION_ENABLED=true
OCR_TESSERACT_ENABLED=true
OCR_CLOUDINARY_FALLBACK_ENABLED=false
OCR_DEFAULT_TIMEOUT=30000
OCR_MAX_RETRY_ATTEMPTS=3
OCR_TESSERACT_LANGUAGE=eng
OCR_PDF_RENDER_DPI=150
```

### Runtime Configuration

The system will support runtime configuration updates through the admin interface, allowing administrators to:

- Enable/disable specific OCR methods
- Adjust timeout and retry settings
- Configure Tesseract language and engine options
- Monitor OCR performance metrics

## Performance Considerations

### Optimization Strategies

1. **Memory Management**

   - Stream processing for large files
   - Immediate cleanup of temporary resources
   - Memory usage monitoring and limits

2. **Processing Efficiency**

   - Parallel processing where possible
   - Caching of processed results
   - Smart fallback decisions based on document characteristics

3. **Resource Allocation**
   - Queue-based processing for high-volume scenarios
   - CPU and memory limits for OCR operations
   - Graceful degradation under high load

## Security Considerations

1. **File Validation**

   - Strict file type checking before processing
   - Size limits to prevent resource exhaustion
   - Malware scanning integration points

2. **Data Privacy**

   - Secure handling of document content during processing
   - Temporary file encryption where required
   - Audit logging for sensitive document processing

3. **Resource Protection**
   - Process isolation for OCR operations
   - Resource usage monitoring and limits
   - Protection against denial-of-service attacks
