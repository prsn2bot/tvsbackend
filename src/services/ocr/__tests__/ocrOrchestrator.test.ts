import { OcrOrchestrator } from "../ocrOrchestrator.service";
import { ocrConfig } from "../ocrConfig";

// Mock all dependencies
jest.mock("../pdfExtractor.service");
jest.mock("../tesseractOcr.service");
jest.mock("../pdfToImageConverter.service");
jest.mock("../../cloudinary.service");
jest.mock("../ocrConfig");

describe("OcrOrchestrator", () => {
  let orchestrator: OcrOrchestrator;

  beforeEach(() => {
    orchestrator = new OcrOrchestrator();
    jest.clearAllMocks();

    // Mock configuration
    (ocrConfig.getConfiguration as jest.Mock).mockReturnValue({
      pdf_extraction_enabled: true,
      tesseract_enabled: true,
      cloudinary_fallback_enabled: false,
      default_timeout: 30000,
      max_retry_attempts: 3,
      tesseract_language: "eng",
      tesseract_engine_mode: "OEM_LSTM_ONLY",
      pdf_render_dpi: 150,
    });

    (ocrConfig.validateConfiguration as jest.Mock).mockReturnValue(true);
  });

  describe("extractText", () => {
    it("should successfully extract text from PDF using native extraction", async () => {
      const mockPdfResult = {
        text: "This is extracted PDF text content",
        pageCount: 3,
        hasSelectableText: true,
        extractionMethod: "native-text",
      };

      // Mock PDF extractor
      jest.doMock("../pdfExtractor.service", () => ({
        pdfExtractor: {
          extractText: jest.fn().mockResolvedValue(mockPdfResult),
        },
      }));

      const result = await orchestrator.extractText("/test/document.pdf");

      expect(result.text).toBe("This is extracted PDF text content");
      expect(result.method).toBe("pdf-extraction");
      expect(result.confidence).toBe(0.9);
      expect(result.metadata?.pageCount).toBe(3);
    });

    it("should fallback to Tesseract OCR for scanned PDFs", async () => {
      const mockPdfResult = {
        text: "", // Empty text from PDF extraction
        pageCount: 2,
        hasSelectableText: false,
        extractionMethod: "native-text",
      };

      const mockConversionResult = {
        pages: [
          {
            pageNumber: 1,
            imageBuffer: Buffer.from("page1"),
            width: 800,
            height: 600,
            format: "png",
          },
          {
            pageNumber: 2,
            imageBuffer: Buffer.from("page2"),
            width: 800,
            height: 600,
            format: "png",
          },
        ],
        totalPages: 2,
        processingTime: 2000,
        originalFileSize: 1024000,
      };

      const mockTesseractResult = {
        text: "OCR extracted text from scanned page",
        confidence: 0.85,
        processingTime: 3000,
      };

      // Mock services
      jest.doMock("../pdfExtractor.service", () => ({
        pdfExtractor: {
          extractText: jest.fn().mockResolvedValue(mockPdfResult),
        },
      }));

      jest.doMock("../pdfToImageConverter.service", () => ({
        pdfToImageConverter: {
          convertPdfToImages: jest.fn().mockResolvedValue(mockConversionResult),
        },
      }));

      jest.doMock("../tesseractOcr.service", () => ({
        tesseractOcr: {
          recognizeBuffer: jest.fn().mockResolvedValue(mockTesseractResult),
        },
      }));

      const result = await orchestrator.extractText("/test/scanned.pdf");

      expect(result.text).toContain("OCR extracted text from scanned page");
      expect(result.method).toBe("pdf-extraction");
      expect(result.metadata?.processingSteps).toContain(
        "pdf-to-image-conversion"
      );
      expect(result.metadata?.processingSteps).toContain("tesseract-ocr");
    });

    it("should use Tesseract OCR directly for image files", async () => {
      const mockTesseractResult = {
        text: "Text extracted from image file",
        confidence: 0.92,
        processingTime: 2500,
      };

      jest.doMock("../tesseractOcr.service", () => ({
        tesseractOcr: {
          preprocessAndRecognize: jest
            .fn()
            .mockResolvedValue(mockTesseractResult),
        },
      }));

      const result = await orchestrator.extractText("/test/image.jpg");

      expect(result.text).toBe("Text extracted from image file");
      expect(result.method).toBe("tesseract-ocr");
      expect(result.confidence).toBe(0.92);
    });

    it("should fallback to next method when first method fails", async () => {
      const mockTesseractResult = {
        text: "Fallback OCR text",
        confidence: 0.75,
        processingTime: 4000,
      };

      // Mock PDF extraction to fail
      jest.doMock("../pdfExtractor.service", () => ({
        pdfExtractor: {
          extractText: jest
            .fn()
            .mockRejectedValue(new Error("PDF extraction failed")),
        },
      }));

      // Mock Tesseract to succeed
      jest.doMock("../tesseractOcr.service", () => ({
        tesseractOcr: {
          preprocessAndRecognize: jest
            .fn()
            .mockResolvedValue(mockTesseractResult),
        },
      }));

      const result = await orchestrator.extractText("/test/document.pdf");

      expect(result.text).toBe("Fallback OCR text");
      expect(result.method).toBe("tesseract-ocr");
    });

    it("should use Cloudinary fallback when enabled", async () => {
      // Enable Cloudinary fallback
      (ocrConfig.getConfiguration as jest.Mock).mockReturnValue({
        pdf_extraction_enabled: false,
        tesseract_enabled: false,
        cloudinary_fallback_enabled: true,
        default_timeout: 30000,
        max_retry_attempts: 3,
      });

      jest.doMock("../../cloudinary.service", () => ({
        getOcrTextFromCloudinary: jest
          .fn()
          .mockResolvedValue("Cloudinary extracted text"),
      }));

      const result = await orchestrator.extractText("documents/test_doc_123");

      expect(result.text).toBe("Cloudinary extracted text");
      expect(result.method).toBe("cloudinary-fallback");
      expect(result.confidence).toBe(0.8);
    });

    it("should throw error when all methods fail", async () => {
      // Mock all methods to fail
      jest.doMock("../pdfExtractor.service", () => ({
        pdfExtractor: {
          extractText: jest.fn().mockRejectedValue(new Error("PDF failed")),
        },
      }));

      jest.doMock("../tesseractOcr.service", () => ({
        tesseractOcr: {
          preprocessAndRecognize: jest
            .fn()
            .mockRejectedValue(new Error("Tesseract failed")),
        },
      }));

      await expect(
        orchestrator.extractText("/test/document.pdf")
      ).rejects.toThrow("All OCR methods failed");
    });

    it("should throw error when no OCR methods are enabled", async () => {
      (ocrConfig.getConfiguration as jest.Mock).mockReturnValue({
        pdf_extraction_enabled: false,
        tesseract_enabled: false,
        cloudinary_fallback_enabled: false,
      });

      await expect(
        orchestrator.extractText("/test/document.pdf")
      ).rejects.toThrow("No OCR methods available");
    });
  });

  describe("processDocumentWithMetrics", () => {
    it("should return result with quality assessment and performance metrics", async () => {
      const mockPdfResult = {
        text: "Sample document text for quality assessment",
        pageCount: 1,
        hasSelectableText: true,
        extractionMethod: "native-text",
      };

      jest.doMock("../pdfExtractor.service", () => ({
        pdfExtractor: {
          extractText: jest.fn().mockResolvedValue(mockPdfResult),
        },
      }));

      const result = await orchestrator.processDocumentWithMetrics(
        "/test/document.pdf"
      );

      expect(result.text).toBe("Sample document text for quality assessment");
      expect(result.qualityAssessment).toBeDefined();
      expect(result.performanceMetrics).toBeDefined();
      expect(result.performanceMetrics.method).toBe("pdf-extraction");
      expect(result.performanceMetrics.textLength).toBeGreaterThan(0);
    });
  });

  describe("processDocumentsBatch", () => {
    it("should process multiple documents and return results", async () => {
      const mockPdfResult = {
        text: "Batch processed text",
        pageCount: 1,
        hasSelectableText: true,
        extractionMethod: "native-text",
      };

      jest.doMock("../pdfExtractor.service", () => ({
        pdfExtractor: {
          extractText: jest.fn().mockResolvedValue(mockPdfResult),
        },
      }));

      const documentUrls = ["/test/doc1.pdf", "/test/doc2.pdf"];
      const results = await orchestrator.processDocumentsBatch(documentUrls);

      expect(results).toHaveLength(2);
      expect(results[0].result?.text).toBe("Batch processed text");
      expect(results[1].result?.text).toBe("Batch processed text");
    });

    it("should handle mixed success and failure in batch processing", async () => {
      jest.doMock("../pdfExtractor.service", () => ({
        pdfExtractor: {
          extractText: jest
            .fn()
            .mockResolvedValueOnce({
              text: "Success text",
              pageCount: 1,
              hasSelectableText: true,
              extractionMethod: "native-text",
            })
            .mockRejectedValueOnce(new Error("Processing failed")),
        },
      }));

      const documentUrls = ["/test/success.pdf", "/test/failure.pdf"];
      const results = await orchestrator.processDocumentsBatch(documentUrls);

      expect(results).toHaveLength(2);
      expect(results[0].result?.text).toBe("Success text");
      expect(results[1].error?.message).toBe("Processing failed");
    });
  });

  describe("getProcessingStats", () => {
    it("should return healthy status when all methods are enabled", () => {
      const stats = orchestrator.getProcessingStats();

      expect(stats.systemHealth).toBe("healthy");
      expect(stats.availableMethods).toContain("pdf-extraction");
      expect(stats.availableMethods).toContain("tesseract-ocr");
      expect(stats.configurationStatus).toBeDefined();
    });

    it("should return degraded status when only one method is enabled", () => {
      (ocrConfig.getConfiguration as jest.Mock).mockReturnValue({
        pdf_extraction_enabled: true,
        tesseract_enabled: false,
        cloudinary_fallback_enabled: false,
      });

      const stats = orchestrator.getProcessingStats();

      expect(stats.systemHealth).toBe("degraded");
      expect(stats.availableMethods).toHaveLength(1);
      expect(stats.availableMethods).toContain("pdf-extraction");
    });

    it("should return unhealthy status when no methods are enabled", () => {
      (ocrConfig.getConfiguration as jest.Mock).mockReturnValue({
        pdf_extraction_enabled: false,
        tesseract_enabled: false,
        cloudinary_fallback_enabled: false,
      });

      const stats = orchestrator.getProcessingStats();

      expect(stats.systemHealth).toBe("unhealthy");
      expect(stats.availableMethods).toHaveLength(0);
    });
  });
});
