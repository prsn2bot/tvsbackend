"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tesseractOcr_service_1 = require("../tesseractOcr.service");
const tesseract_js_1 = __importDefault(require("tesseract.js"));
const fs_1 = __importDefault(require("fs"));
// Mock dependencies
jest.mock("tesseract.js");
jest.mock("fs");
describe("TesseractOcrService", () => {
    let tesseractOcr;
    const mockFilePath = "/test/image.jpg";
    beforeEach(() => {
        tesseractOcr = new tesseractOcr_service_1.TesseractOcrService();
        jest.clearAllMocks();
    });
    afterEach(async () => {
        await tesseractOcr.cleanup();
    });
    describe("recognizeText", () => {
        it("should extract text from a valid image", async () => {
            // Mock file system
            const mockStats = { isFile: () => true, size: 1024 * 1024 }; // 1MB
            fs_1.default.promises.stat.mockResolvedValue(mockStats);
            // Mock Tesseract worker
            const mockWorker = {
                loadLanguage: jest.fn().mockResolvedValue(undefined),
                initialize: jest.fn().mockResolvedValue(undefined),
                setParameters: jest.fn().mockResolvedValue(undefined),
                recognize: jest.fn().mockResolvedValue({
                    data: {
                        text: "Hello World\nThis is a test image.",
                        confidence: 85.5,
                    },
                }),
                terminate: jest.fn().mockResolvedValue(undefined),
            };
            tesseract_js_1.default.createWorker.mockResolvedValue(mockWorker);
            const result = await tesseractOcr.recognizeText(mockFilePath);
            expect(result.text).toContain("Hello World");
            expect(result.text).toContain("This is a test image");
            expect(result.confidence).toBe(0.855); // Converted to 0-1 scale
            expect(result.processingTime).toBeGreaterThan(0);
            expect(mockWorker.recognize).toHaveBeenCalledWith(mockFilePath);
        });
        it("should handle OCR timeout errors", async () => {
            const mockStats = { isFile: () => true, size: 1024 };
            fs_1.default.promises.stat.mockResolvedValue(mockStats);
            const mockWorker = {
                loadLanguage: jest.fn().mockResolvedValue(undefined),
                initialize: jest.fn().mockResolvedValue(undefined),
                setParameters: jest.fn().mockResolvedValue(undefined),
                recognize: jest
                    .fn()
                    .mockRejectedValue(new Error("Recognition timeout")),
                terminate: jest.fn().mockResolvedValue(undefined),
            };
            tesseract_js_1.default.createWorker.mockResolvedValue(mockWorker);
            await expect(tesseractOcr.recognizeText(mockFilePath)).rejects.toThrow("Recognition timeout");
        });
        it("should throw error for non-existent file", async () => {
            fs_1.default.promises.stat.mockRejectedValue(new Error("File not found"));
            await expect(tesseractOcr.recognizeText(mockFilePath)).rejects.toThrow("File not found");
        });
        it("should throw error for file too large", async () => {
            const mockStats = {
                isFile: () => true,
                size: 25 * 1024 * 1024, // 25MB - exceeds 20MB limit
            };
            fs_1.default.promises.stat.mockResolvedValue(mockStats);
            await expect(tesseractOcr.recognizeText(mockFilePath)).rejects.toThrow("File too large");
        });
        it("should throw error for unsupported file format", async () => {
            const txtFilePath = "/test/document.txt";
            const mockStats = { isFile: () => true, size: 1024 };
            fs_1.default.promises.stat.mockResolvedValue(mockStats);
            await expect(tesseractOcr.recognizeText(txtFilePath)).rejects.toThrow("Unsupported file format");
        });
    });
    describe("recognizeBuffer", () => {
        it("should extract text from image buffer", async () => {
            const mockBuffer = Buffer.from("mock image data");
            const mockWorker = {
                loadLanguage: jest.fn().mockResolvedValue(undefined),
                initialize: jest.fn().mockResolvedValue(undefined),
                setParameters: jest.fn().mockResolvedValue(undefined),
                recognize: jest.fn().mockResolvedValue({
                    data: {
                        text: "Buffer text content",
                        confidence: 90.0,
                    },
                }),
                terminate: jest.fn().mockResolvedValue(undefined),
            };
            tesseract_js_1.default.createWorker.mockResolvedValue(mockWorker);
            const result = await tesseractOcr.recognizeBuffer(mockBuffer);
            expect(result.text).toBe("Buffer text content");
            expect(result.confidence).toBe(0.9);
            expect(mockWorker.recognize).toHaveBeenCalledWith(mockBuffer);
        });
        it("should handle buffer processing errors", async () => {
            const mockBuffer = Buffer.from("invalid image data");
            const mockWorker = {
                loadLanguage: jest.fn().mockResolvedValue(undefined),
                initialize: jest.fn().mockResolvedValue(undefined),
                setParameters: jest.fn().mockResolvedValue(undefined),
                recognize: jest
                    .fn()
                    .mockRejectedValue(new Error("Invalid image format")),
                terminate: jest.fn().mockResolvedValue(undefined),
            };
            tesseract_js_1.default.createWorker.mockResolvedValue(mockWorker);
            await expect(tesseractOcr.recognizeBuffer(mockBuffer)).rejects.toThrow("Invalid image format");
        });
    });
    describe("recognizeWithFallback", () => {
        it("should try multiple engine modes and return best result", async () => {
            const mockStats = { isFile: () => true, size: 1024 };
            fs_1.default.promises.stat.mockResolvedValue(mockStats);
            const mockWorker = {
                loadLanguage: jest.fn().mockResolvedValue(undefined),
                initialize: jest.fn().mockResolvedValue(undefined),
                setParameters: jest.fn().mockResolvedValue(undefined),
                recognize: jest
                    .fn()
                    .mockResolvedValueOnce({
                    data: { text: "Low quality text", confidence: 60.0 },
                })
                    .mockResolvedValueOnce({
                    data: { text: "High quality text", confidence: 95.0 },
                }),
                terminate: jest.fn().mockResolvedValue(undefined),
            };
            tesseract_js_1.default.createWorker.mockResolvedValue(mockWorker);
            const result = await tesseractOcr.recognizeWithFallback(mockFilePath);
            expect(result.text).toBe("High quality text");
            expect(result.confidence).toBe(0.95);
            expect(mockWorker.recognize).toHaveBeenCalledTimes(2);
        });
        it("should return early on high confidence result", async () => {
            const mockStats = { isFile: () => true, size: 1024 };
            fs_1.default.promises.stat.mockResolvedValue(mockStats);
            const mockWorker = {
                loadLanguage: jest.fn().mockResolvedValue(undefined),
                initialize: jest.fn().mockResolvedValue(undefined),
                setParameters: jest.fn().mockResolvedValue(undefined),
                recognize: jest.fn().mockResolvedValue({
                    data: { text: "Excellent quality text", confidence: 85.0 },
                }),
                terminate: jest.fn().mockResolvedValue(undefined),
            };
            tesseract_js_1.default.createWorker.mockResolvedValue(mockWorker);
            const result = await tesseractOcr.recognizeWithFallback(mockFilePath);
            expect(result.confidence).toBe(0.85);
            expect(mockWorker.recognize).toHaveBeenCalledTimes(1);
        });
    });
    describe("preprocessAndRecognize", () => {
        it("should perform basic recognition and assess quality", async () => {
            const mockStats = { isFile: () => true, size: 1024 };
            fs_1.default.promises.stat.mockResolvedValue(mockStats);
            const mockWorker = {
                loadLanguage: jest.fn().mockResolvedValue(undefined),
                initialize: jest.fn().mockResolvedValue(undefined),
                setParameters: jest.fn().mockResolvedValue(undefined),
                recognize: jest.fn().mockResolvedValue({
                    data: {
                        text: "Clear and readable text content",
                        confidence: 88.0,
                    },
                }),
                terminate: jest.fn().mockResolvedValue(undefined),
            };
            tesseract_js_1.default.createWorker.mockResolvedValue(mockWorker);
            const result = await tesseractOcr.preprocessAndRecognize(mockFilePath, {
                enhanceContrast: true,
                removeNoise: true,
            });
            expect(result.text).toBe("Clear and readable text content");
            expect(result.confidence).toBe(0.88);
        });
    });
    describe("getSupportedLanguages", () => {
        it("should return list of supported language codes", async () => {
            const languages = await tesseractOcr.getSupportedLanguages();
            expect(languages).toContain("eng");
            expect(languages).toContain("spa");
            expect(languages).toContain("fra");
            expect(languages.length).toBeGreaterThan(5);
        });
    });
    describe("cleanup", () => {
        it("should terminate worker successfully", async () => {
            const mockWorker = {
                loadLanguage: jest.fn().mockResolvedValue(undefined),
                initialize: jest.fn().mockResolvedValue(undefined),
                setParameters: jest.fn().mockResolvedValue(undefined),
                terminate: jest.fn().mockResolvedValue(undefined),
            };
            tesseract_js_1.default.createWorker.mockResolvedValue(mockWorker);
            // Initialize worker first
            await tesseractOcr.reinitialize();
            // Then cleanup
            await tesseractOcr.cleanup();
            expect(mockWorker.terminate).toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=tesseractOcr.test.js.map