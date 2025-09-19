export interface OcrResult {
  text: string;
  method: "pdf-extraction" | "tesseract-ocr";
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

export interface OcrOptions {
  enablePdfExtraction: boolean;
  enableTesseractOcr: boolean;
  timeout: number;
  retryAttempts: number;
}

export interface PdfExtractionResult {
  text: string;
  pageCount: number;
  hasSelectableText: boolean;
  extractionMethod: "native-text" | "rendered-text";
}

export interface TesseractOptions {
  language: string;
  engineMode: "OEM_LSTM_ONLY" | "OEM_TESSERACT_LSTM_COMBINED";
  pageSegMode: "PSM_AUTO" | "PSM_SINGLE_BLOCK" | "PSM_SINGLE_LINE";
}

export interface TesseractResult {
  text: string;
  confidence: number;
  processingTime: number;
}

export interface DocumentOcrMetadata {
  ocr_method_used?: string;
  ocr_confidence?: number;
  ocr_processing_time?: number;
  ocr_retry_count?: number;
  ocr_error_details?: string;
  ocr_last_attempt?: Date;
}

export interface OcrConfiguration {
  pdf_extraction_enabled: boolean;
  tesseract_enabled: boolean;
  default_timeout: number;
  max_retry_attempts: number;
  tesseract_language: string;
  tesseract_engine_mode: string;
  pdf_render_dpi: number;
}

export interface OcrErrorRecovery {
  maxRetries: number;
  backoffStrategy: "linear" | "exponential";
  fallbackChain: OcrMethod[];
  timeoutHandling: {
    initialTimeout: number;
    maxTimeout: number;
    timeoutMultiplier: number;
  };
}

export type OcrMethod = "pdf-extraction" | "tesseract-ocr";

export class OcrError extends Error {
  constructor(
    message: string,
    public method: OcrMethod,
    public originalError?: Error,
    public retryable: boolean = true
  ) {
    super(message);
    this.name = "OcrError";
  }
}

// Additional interfaces for enhanced functionality

export interface OcrProcessingContext {
  documentId?: string;
  documentUrl: string;
  documentType: DocumentType;
  fileSize?: number;
  originalFilename?: string;
  startTime: number;
  attemptCount: number;
  lastError?: Error;
}

export interface OcrMethodResult {
  success: boolean;
  result?: Omit<OcrResult, "method" | "processingTime">;
  error?: OcrError;
  processingTime: number;
}

export interface OcrPerformanceMetrics {
  method: OcrMethod;
  documentType: DocumentType;
  fileSize: number;
  processingTime: number;
  success: boolean;
  confidence?: number;
  textLength: number;
  timestamp: Date;
}

export interface OcrQualityAssessment {
  textLength: number;
  hasValidText: boolean;
  confidence: number;
  estimatedAccuracy: number;
  containsGibberish: boolean;
  languageDetected?: string;
}

export interface OcrRetryStrategy {
  shouldRetry: (error: OcrError, attemptCount: number) => boolean;
  getRetryDelay: (attemptCount: number) => number;
  maxAttempts: number;
}

export interface DocumentProcessingOptions {
  ocrOptions?: Partial<OcrOptions>;
  qualityThreshold?: number;
  enableQualityAssessment?: boolean;
  enablePerformanceTracking?: boolean;
  customRetryStrategy?: OcrRetryStrategy;
}

export type DocumentType = "pdf" | "image" | "unknown";

export type SupportedFileExtension =
  | "pdf"
  | "jpg"
  | "jpeg"
  | "png"
  | "tiff"
  | "tif"
  | "bmp"
  | "webp";

// Utility type for OCR method capabilities
export interface OcrMethodCapabilities {
  supportedFormats: SupportedFileExtension[];
  maxFileSize: number;
  averageProcessingTime: number;
  reliability: number; // 0-1 scale
  qualityScore: number; // 0-1 scale
}

// Configuration for different OCR methods
export interface OcrMethodsConfig {
  "pdf-extraction": OcrMethodCapabilities;
  "tesseract-ocr": OcrMethodCapabilities;
}

// Event types for OCR processing
export interface OcrProcessingEvent {
  type:
    | "started"
    | "method-attempt"
    | "method-success"
    | "method-failure"
    | "completed"
    | "failed";
  timestamp: Date;
  documentId?: string;
  method?: OcrMethod;
  message: string;
  data?: any;
}

// Callback type for OCR processing events
export type OcrEventCallback = (event: OcrProcessingEvent) => void;
