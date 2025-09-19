# OCR Fallback System

A comprehensive OCR (Optical Character Recognition) system with multiple extraction methods and automatic fallback capabilities for reliable text extraction from documents.

## Overview

The OCR Fallback System provides robust document text extraction using multiple OCR approaches:

1. **PDF.js Text Extraction** - Fast native text extraction from PDF documents
2. **Tesseract.js OCR** - Image-based OCR for scanned documents and images
3. **Cloudinary Fallback** - External OCR service as final fallback option

The system automatically selects the best method based on document type and falls back to alternative methods if the primary approach fails.

## Features

- **Multi-Method OCR**: PDF.js, Tesseract.js, and Cloudinary integration
- **Automatic Fallback**: Seamless switching between OCR methods on failure
- **Quality Assessment**: Text quality evaluation and confidence scoring
- **Performance Monitoring**: Detailed metrics and processing statistics
- **Error Handling**: Comprehensive error recovery and retry mechanisms
- **Metadata Tracking**: Complete OCR processing history and analytics
- **Configuration Management**: Runtime configuration and method toggling

## Quick Start

### Basic Usage

```typescript
import { ocrOrchestrator } from "./services/ocr";

// Extract text from any document
const result = await ocrOrchestrator.extractText("/path/to/document.pdf");

console.log("Extracted text:", result.text);
console.log("Method used:", result.method);
console.log("Confidence:", result.confidence);
console.log("Processing time:", result.processingTime);
```

### Advanced Usage with Options

```typescript
import { ocrOrchestrator } from "./services/ocr";

const result = await ocrOrchestrator.extractText("/path/to/document.pdf", {
  enablePdfExtraction: true,
  enableTesseractOcr: true,
  enableCloudinaryFallback: false,
  timeout: 30000,
  retryAttempts: 2,
});
```

### Processing with Metrics

```typescript
const result = await ocrOrchestrator.processDocumentWithMetrics(
  "/path/to/document.pdf"
);

console.log("Quality assessment:", result.qualityAssessment);
console.log("Performance metrics:", result.performanceMetrics);
```

## Configuration

### Environment Variables

```env
# OCR Configuration
OCR_PDF_EXTRACTION_ENABLED=true
OCR_TESSERACT_ENABLED=true
OCR_CLOUDINARY_FALLBACK_ENABLED=false
OCR_DEFAULT_TIMEOUT=30000
OCR_MAX_RETRY_ATTEMPTS=3
OCR_TESSERACT_LANGUAGE=eng
OCR_TESSERACT_ENGINE_MODE=OEM_LSTM_ONLY
OCR_PDF_RENDER_DPI=150
```

### Runtime Configuration

```typescript
import { ocrConfig } from "./services/ocr";

// Update configuration at runtime
ocrConfig.updateConfiguration({
  pdf_extraction_enabled: true,
  tesseract_enabled: true,
  default_timeout: 45000,
});

// Reload from environment
ocrConfig.reloadConfiguration();
```

## API Reference

### OcrOrchestrator

The main orchestrator service that coordinates OCR operations.

#### Methods

##### `extractText(documentUrl: string, options?: Partial<OcrOptions>): Promise<OcrResult>`

Extracts text from a document using the best available method with automatic fallback.

**Parameters:**

- `documentUrl` - Path or URL to the document
- `options` - OCR processing options (optional)

**Returns:** Promise resolving to `OcrResult` with extracted text and metadata

##### `processDocumentWithMetrics(documentUrl: string, options?: Partial<OcrOptions>)`

Processes a document with comprehensive quality assessment and performance metrics.

##### `processDocumentsBatch(documentUrls: string[], options?: Partial<OcrOptions>)`

Processes multiple documents in batch with individual error handling.

##### `getProcessingStats()`

Returns current system health and processing statistics.

### Individual Services

#### PdfExtractorService

Handles PDF text extraction using PDF.js.

```typescript
import { pdfExtractor } from "./services/ocr";

const result = await pdfExtractor.extractText("/path/to/document.pdf", {
  qualityThreshold: 0.5,
  enableFallbackRendering: true,
});
```

#### TesseractOcrService

Manages image-based OCR using Tesseract.js.

```typescript
import { tesseractOcr } from "./services/ocr";

const result = await tesseractOcr.recognizeText("/path/to/image.jpg", {
  language: "eng",
  engineMode: "OEM_LSTM_ONLY",
});
```

#### PdfToImageConverter

Converts PDF pages to images for OCR processing.

```typescript
import { pdfToImageConverter } from "./services/ocr";

const result = await pdfToImageConverter.convertPdfToImages(
  "/path/to/document.pdf",
  {
    dpi: 150,
    format: "png",
    maxPages: 5,
  }
);
```

## Types and Interfaces

### OcrResult

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
    fileSize?: number;
    originalFormat?: string;
    processingSteps?: string[];
  };
}
```

### OcrOptions

```typescript
interface OcrOptions {
  enablePdfExtraction: boolean;
  enableTesseractOcr: boolean;
  enableCloudinaryFallback: boolean;
  timeout: number;
  retryAttempts: number;
}
```

## Error Handling

The system provides comprehensive error handling with specific error types:

```typescript
import { OCR_ERROR_CODES, EnhancedOcrError } from "./services/ocr";

try {
  const result = await ocrOrchestrator.extractText("/path/to/document.pdf");
} catch (error) {
  if (error instanceof EnhancedOcrError) {
    console.log("OCR Error Code:", error.errorCode);
    console.log("Method:", error.method);
    console.log("Retryable:", error.retryable);
  }
}
```

### Error Codes

- `FILE_NOT_FOUND` - Document file not found
- `FILE_TOO_LARGE` - File exceeds size limits
- `UNSUPPORTED_FORMAT` - File format not supported
- `CORRUPTED_FILE` - File appears to be corrupted
- `TIMEOUT` - Processing timeout exceeded
- `MEMORY_ERROR` - Insufficient memory for processing
- `PROCESSING_FAILED` - General processing failure
- `NO_TEXT_FOUND` - No text could be extracted
- `NETWORK_ERROR` - Network connectivity issues
- `SERVICE_UNAVAILABLE` - External service unavailable
- `LOW_QUALITY` - Extracted text quality below threshold
- `GIBBERISH_DETECTED` - Text appears to be gibberish

## Performance Optimization

### Best Practices

1. **Choose Appropriate DPI**: Use 150 DPI for most documents, 200+ for small text
2. **Limit Page Processing**: Process only necessary pages for large documents
3. **Use Batch Processing**: Process multiple documents efficiently
4. **Monitor Memory Usage**: Clean up resources after processing
5. **Configure Timeouts**: Set appropriate timeouts based on document complexity

### Performance Monitoring

```typescript
// Get system health status
const stats = ocrOrchestrator.getProcessingStats();
console.log("System health:", stats.systemHealth);
console.log("Available methods:", stats.availableMethods);

// Monitor processing metrics
const result = await ocrOrchestrator.processDocumentWithMetrics(
  "/path/to/doc.pdf"
);
console.log("Processing time:", result.performanceMetrics.totalProcessingTime);
console.log("Quality score:", result.qualityAssessment.estimatedAccuracy);
```

## Database Integration

The system automatically tracks OCR metadata in the database:

```sql
-- OCR metadata columns in documents table
ALTER TABLE documents ADD COLUMN ocr_method_used VARCHAR(50);
ALTER TABLE documents ADD COLUMN ocr_confidence DECIMAL(3,2);
ALTER TABLE documents ADD COLUMN ocr_processing_time INTEGER;
ALTER TABLE documents ADD COLUMN ocr_retry_count INTEGER DEFAULT 0;
ALTER TABLE documents ADD COLUMN ocr_error_details TEXT;
ALTER TABLE documents ADD COLUMN ocr_last_attempt TIMESTAMP;
```

### Metadata Service

```typescript
import { ocrMetadataService } from "./services/ocr";

// Update document with OCR results
await ocrMetadataService.updateDocumentWithOcrResult(documentId, ocrResult);

// Handle OCR failures
await ocrMetadataService.updateDocumentWithOcrFailure(
  documentId,
  "tesseract-ocr",
  "Processing timeout"
);

// Get processing statistics
const stats = await ocrMetadataService.getOcrProcessingStats();
```

## Testing

### Unit Tests

Run individual service tests:

```bash
npm test -- --testPathPattern=ocr
```

### Integration Tests

Test complete OCR workflows:

```bash
npm test -- --testPathPattern=integration
```

### Performance Tests

Benchmark OCR performance:

```bash
npm run test:performance
```

## Troubleshooting

### Common Issues

1. **PDF.js Worker Not Found**

   ```typescript
   // Ensure worker is properly configured
   pdfjs.GlobalWorkerOptions.workerSrc = require.resolve(
     "pdfjs-dist/build/pdf.worker.js"
   );
   ```

2. **Tesseract Language Not Found**

   ```bash
   # Install required language packs
   npm install tesseract.js-languages
   ```

3. **Memory Issues with Large Files**

   ```typescript
   // Use streaming conversion for large PDFs
   const pages = await pdfToImageConverter.convertPagesStreaming(
     filePath,
     [1, 2, 3]
   );
   ```

4. **Canvas Module Issues on Windows**
   ```bash
   # Install Windows build tools
   npm install --global windows-build-tools
   npm rebuild canvas
   ```

### Debug Logging

Enable detailed logging:

```typescript
import logger from "./utils/logger";

// Set log level to debug
logger.level = "debug";
```

## Migration Guide

### From Legacy OCR System

1. **Update Imports**

   ```typescript
   // Old
   import { getOcrTextFromCloudinary } from "./services/cloudinary.service";

   // New
   import { ocrOrchestrator } from "./services/ocr";
   ```

2. **Update Function Calls**

   ```typescript
   // Old
   const text = await getOcrTextFromCloudinary(publicId);

   // New
   const result = await ocrOrchestrator.extractText(publicId);
   const text = result.text;
   ```

3. **Handle Enhanced Results**
   ```typescript
   // Access additional metadata
   console.log("Method used:", result.method);
   console.log("Confidence:", result.confidence);
   console.log("Processing time:", result.processingTime);
   ```

## Contributing

### Development Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run tests:

   ```bash
   npm test
   ```

3. Build project:
   ```bash
   npm run build
   ```

### Adding New OCR Methods

1. Create service class implementing OCR interface
2. Add method to orchestrator switch statement
3. Update configuration options
4. Add comprehensive tests
5. Update documentation

## License

This OCR system is part of the larger application and follows the same licensing terms.
