"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ocrOrchestrator_service_1 = require("../ocrOrchestrator.service");
const ocrConfig_1 = require("../ocrConfig");
const fs_1 = __importDefault(require("fs"));
// Mock file system and external dependencies
jest.mock("fs");
jest.mock("../pdfExtractor.service");
jest.mock("../tesseractOcr.service");
jest.mock("../pdfToImageConverter.service");
jest.mock("../../cloudinary.service");
describe("OCR System Integration Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock configuration
        ocrConfig_1.ocrConfig.getConfiguration.mockReturnValue({
            pdf_extraction_enabled: true,
            tesseract_enabled: true,
            cloudinary_fallback_enabled: true,
            default_timeout: 30000,
            max_retry_attempts: 3,
            tesseract_language: "eng",
            tesseract_engine_mode: "OEM_LSTM_ONLY",
            pdf_render_dpi: 150,
        });
        ocrConfig_1.ocrConfig.validateConfiguration.mockReturnValue(true);
    });
    describe("End-to-End OCR Processing", () => {
        it("should process PDF document with native text extraction", async () => {
            // Mock file system
            const mockStats = { isFile: () => true, size: 2 * 1024 * 1024 };
            fs_1.default.promises.stat.mockResolvedValue(mockStats);
            // Mock successful PDF extraction
            const mockPdfResult = {
                text: "This is a comprehensive legal document with detailed allegations and evidence.",
                pageCount: 5,
                hasSelectableText: true,
                extractionMethod: "native-text",
            };
            jest.doMock("../pdfExtractor.service", () => ({
                pdfExtractor: {
                    extractText: jest.fn().mockResolvedValue(mockPdfResult),
                },
            }));
            const result = await ocrOrchestrator_service_1.ocrOrchestrator.extractText("/test/legal-document.pdf");
            expect(result.text).toBe(mockPdfResult.text);
            expect(result.method).toBe("pdf-extraction");
            expect(result.confidence).toBe(0.9);
            expect(result.processingTime).toBeGreaterThan(0);
            expect(result.metadata?.pageCount).toBe(5);
            expect(result.metadata?.processingSteps).toContain("pdf-native-text-extraction");
        });
        it("should handle PDF with fallback to image OCR", async () => {
            const mockStats = { isFile: () => true, size: 3 * 1024 * 1024 };
            fs_1.default.promises.stat.mockResolvedValue(mockStats);
            // Mock PDF extraction with minimal text
            const mockPdfResult = {
                text: "",
                pageCount: 3,
                hasSelectableText: false,
                extractionMethod: "native-text",
            };
            // Mock image conversion
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
                    {
                        pageNumber: 3,
                        imageBuffer: Buffer.from("page3"),
                        width: 800,
                        height: 600,
                        format: "png",
                    },
                ],
                totalPages: 3,
                processingTime: 5000,
                originalFileSize: 3 * 1024 * 1024,
            };
            // Mock Tesseract OCR results
            const mockTesseractResults = [
                {
                    text: "Page 1: Legal proceedings document",
                    confidence: 0.88,
                    processingTime: 2000,
                },
                {
                    text: "Page 2: Evidence and witness statements",
                    confidence: 0.85,
                    processingTime: 2200,
                },
                {
                    text: "Page 3: Conclusion and recommendations",
                    confidence: 0.9,
                    processingTime: 1800,
                },
            ];
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
                    recognizeBuffer: jest
                        .fn()
                        .mockResolvedValueOnce(mockTesseractResults[0])
                        .mockResolvedValueOnce(mockTesseractResults[1])
                        .mockResolvedValueOnce(mockTesseractResults[2]),
                },
            }));
            const result = await ocrOrchestrator_service_1.ocrOrchestrator.extractText("/test/scanned-document.pdf");
            expect(result.text).toContain("Legal proceedings document");
            expect(result.text).toContain("Evidence and witness statements");
            expect(result.text).toContain("Conclusion and recommendations");
            expect(result.method).toBe("pdf-extraction");
            expect(result.confidence).toBeCloseTo(0.877, 2); // Average of confidences
            expect(result.metadata?.processingSteps).toContain("pdf-to-image-conversion");
            expect(result.metadata?.processingSteps).toContain("tesseract-ocr");
            expect(result.metadata?.imageCount).toBe(3);
        });
        it("should process image files directly with Tesseract", async () => {
            const mockStats = { isFile: () => true, size: 1024 * 1024 };
            fs_1.default.promises.stat.mockResolvedValue(mockStats);
            const mockTesseractResult = {
                text: "This is text extracted from an image document containing important legal information.",
                confidence: 0.93,
                processingTime: 3500,
            };
            jest.doMock("../tesseractOcr.service", () => ({
                tesseractOcr: {
                    preprocessAndRecognize: jest
                        .fn()
                        .mockResolvedValue(mockTesseractResult),
                },
            }));
            const result = await ocrOrchestrator_service_1.ocrOrchestrator.extractText("/test/document-image.jpg");
            expect(result.text).toBe(mockTesseractResult.text);
            expect(result.method).toBe("tesseract-ocr");
            expect(result.confidence).toBe(0.93);
            expect(result.metadata?.processingSteps).toContain("tesseract-ocr-with-preprocessing");
        });
        it("should use Cloudinary fallback when other methods fail", async () => {
            const mockStats = { isFile: () => true, size: 1024 * 1024 };
            fs_1.default.promises.stat.mockResolvedValue(mockStats);
            // Mock PDF extraction failure
            jest.doMock("../pdfExtractor.service", () => ({
                pdfExtractor: {
                    extractText: jest
                        .fn()
                        .mockRejectedValue(new Error("PDF processing failed")),
                },
            }));
            // Mock Tesseract failure
            jest.doMock("../tesseractOcr.service", () => ({
                tesseractOcr: {
                    preprocessAndRecognize: jest
                        .fn()
                        .mockRejectedValue(new Error("Tesseract processing failed")),
                },
            }));
            // Mock Cloudinary success
            jest.doMock("../../cloudinary.service", () => ({
                getOcrTextFromCloudinary: jest
                    .fn()
                    .mockResolvedValue("Cloudinary extracted text from fallback service"),
            }));
            const result = await ocrOrchestrator_service_1.ocrOrchestrator.extractText("documents/fallback_test_123");
            expect(result.text).toBe("Cloudinary extracted text from fallback service");
            expect(result.method).toBe("cloudinary-fallback");
            expect(result.confidence).toBe(0.8);
            expect(result.metadata?.processingSteps).toContain("cloudinary-ocr-service");
        });
    });
    describe("Batch Processing", () => {
        it("should process multiple documents with mixed results", async () => {
            const mockStats = { isFile: () => true, size: 1024 * 1024 };
            fs_1.default.promises.stat.mockResolvedValue(mockStats);
            // Mock mixed success/failure scenarios
            jest.doMock("../pdfExtractor.service", () => ({
                pdfExtractor: {
                    extractText: jest
                        .fn()
                        .mockResolvedValueOnce({
                        text: "Document 1 text",
                        pageCount: 1,
                        hasSelectableText: true,
                        extractionMethod: "native-text",
                    })
                        .mockRejectedValueOnce(new Error("Document 2 failed"))
                        .mockResolvedValueOnce({
                        text: "Document 3 text",
                        pageCount: 2,
                        hasSelectableText: true,
                        extractionMethod: "native-text",
                    }),
                },
            }));
            jest.doMock("../tesseractOcr.service", () => ({
                tesseractOcr: {
                    preprocessAndRecognize: jest.fn().mockResolvedValue({
                        text: "Document 2 fallback text",
                        confidence: 0.75,
                        processingTime: 4000,
                    }),
                },
            }));
            const documentUrls = [
                "/test/doc1.pdf",
                "/test/doc2.pdf",
                "/test/doc3.pdf",
            ];
            const results = await ocrOrchestrator_service_1.ocrOrchestrator.processDocumentsBatch(documentUrls);
            expect(results).toHaveLength(3);
            expect(results[0].result?.text).toBe("Document 1 text");
            expect(results[1].result?.text).toBe("Document 2 fallback text");
            expect(results[2].result?.text).toBe("Document 3 text");
        });
    });
    describe("Performance and Quality Assessment", () => {
        it("should provide comprehensive metrics and quality assessment", async () => {
            const mockStats = { isFile: () => true, size: 2 * 1024 * 1024 };
            fs_1.default.promises.stat.mockResolvedValue(mockStats);
            const mockPdfResult = {
                text: "This is a high-quality document with clear text and proper formatting. The content includes legal terminology and structured information that should be easily readable.",
                pageCount: 4,
                hasSelectableText: true,
                extractionMethod: "native-text",
            };
            jest.doMock("../pdfExtractor.service", () => ({
                pdfExtractor: {
                    extractText: jest.fn().mockResolvedValue(mockPdfResult),
                },
            }));
            const result = await ocrOrchestrator_service_1.ocrOrchestrator.processDocumentWithMetrics("/test/quality-doc.pdf");
            expect(result.text).toBe(mockPdfResult.text);
            expect(result.qualityAssessment).toBeDefined();
            expect(result.qualityAssessment.textLength).toBeGreaterThan(100);
            expect(result.qualityAssessment.hasValidText).toBe(true);
            expect(result.qualityAssessment.estimatedAccuracy).toBeGreaterThan(0.8);
            expect(result.qualityAssessment.containsGibberish).toBe(false);
            expect(result.performanceMetrics).toBeDefined();
            expect(result.performanceMetrics.method).toBe("pdf-extraction");
            expect(result.performanceMetrics.totalProcessingTime).toBeGreaterThan(0);
            expect(result.performanceMetrics.textLength).toBeGreaterThan(100);
            expect(result.performanceMetrics.confidence).toBe(0.9);
        });
    });
    describe("Error Handling and Recovery", () => {
        it("should handle configuration errors gracefully", async () => {
            // Mock invalid configuration
            ocrConfig_1.ocrConfig.validateConfiguration.mockReturnValue(false);
            await expect(ocrOrchestrator_service_1.ocrOrchestrator.extractText("/test/document.pdf")).rejects.toThrow("Invalid OCR configuration");
        });
        it("should handle file system errors", async () => {
            fs_1.default.promises.stat.mockRejectedValue(new Error("File system error"));
            await expect(ocrOrchestrator_service_1.ocrOrchestrator.extractText("/nonexistent/document.pdf")).rejects.toThrow();
        });
        it("should handle all methods failing", async () => {
            const mockStats = { isFile: () => true, size: 1024 * 1024 };
            fs_1.default.promises.stat.mockResolvedValue(mockStats);
            // Mock all methods failing
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
            jest.doMock("../../cloudinary.service", () => ({
                getOcrTextFromCloudinary: jest
                    .fn()
                    .mockRejectedValue(new Error("Cloudinary failed")),
            }));
            await expect(ocrOrchestrator_service_1.ocrOrchestrator.extractText("/test/problematic-document.pdf")).rejects.toThrow("All OCR methods failed");
        });
    });
    describe("System Health and Statistics", () => {
        it("should report healthy system status", () => {
            const stats = ocrOrchestrator_service_1.ocrOrchestrator.getProcessingStats();
            expect(stats.systemHealth).toBe("healthy");
            expect(stats.availableMethods).toContain("pdf-extraction");
            expect(stats.availableMethods).toContain("tesseract-ocr");
            expect(stats.availableMethods).toContain("cloudinary-fallback");
            expect(stats.configurationStatus).toBeDefined();
        });
        it("should report degraded status with limited methods", () => {
            ocrConfig_1.ocrConfig.getConfiguration.mockReturnValue({
                pdf_extraction_enabled: true,
                tesseract_enabled: false,
                cloudinary_fallback_enabled: false,
            });
            const stats = ocrOrchestrator_service_1.ocrOrchestrator.getProcessingStats();
            expect(stats.systemHealth).toBe("degraded");
            expect(stats.availableMethods).toHaveLength(1);
            expect(stats.availableMethods).toContain("pdf-extraction");
        });
        it("should report unhealthy status with no methods", () => {
            ocrConfig_1.ocrConfig.getConfiguration.mockReturnValue({
                pdf_extraction_enabled: false,
                tesseract_enabled: false,
                cloudinary_fallback_enabled: false,
            });
            const stats = ocrOrchestrator_service_1.ocrOrchestrator.getProcessingStats();
            expect(stats.systemHealth).toBe("unhealthy");
            expect(stats.availableMethods).toHaveLength(0);
        });
    });
});
//# sourceMappingURL=integration.test.js.map