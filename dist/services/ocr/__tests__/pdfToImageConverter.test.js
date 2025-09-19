"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pdfToImageConverter_service_1 = require("../pdfToImageConverter.service");
const fs_1 = __importDefault(require("fs"));
// Mock dependencies
jest.mock("pdfjs-dist");
jest.mock("canvas");
jest.mock("fs");
describe("PdfToImageConverter", () => {
    let converter;
    const mockFilePath = "/test/document.pdf";
    const mockOutputDir = "/test/output";
    beforeEach(() => {
        converter = new pdfToImageConverter_service_1.PdfToImageConverter();
        jest.clearAllMocks();
    });
    describe("convertPdfToImages", () => {
        it("should convert PDF pages to image buffers", async () => {
            // Mock file system
            const mockStats = { isFile: () => true, size: 5 * 1024 * 1024 }; // 5MB
            fs_1.default.promises.stat.mockResolvedValue(mockStats);
            fs_1.default.promises.readFile.mockResolvedValue(Buffer.from("mock pdf data"));
            // Mock canvas
            const mockCanvas = {
                toBuffer: jest.fn().mockReturnValue(Buffer.from("mock image data")),
            };
            const mockContext = {};
            const { createCanvas } = require("canvas");
            createCanvas.mockReturnValue({
                ...mockCanvas,
                getContext: () => mockContext,
            });
            // Mock PDF.js
            const mockPage = {
                getViewport: jest.fn().mockReturnValue({ width: 800, height: 600 }),
                render: jest.fn().mockReturnValue({ promise: Promise.resolve() }),
                cleanup: jest.fn(),
            };
            const mockPdfDocument = {
                numPages: 2,
                getPage: jest.fn().mockResolvedValue(mockPage),
                destroy: jest.fn().mockResolvedValue(undefined),
            };
            const mockLoadingTask = {
                promise: Promise.resolve(mockPdfDocument),
            };
            const pdfjs = require("pdfjs-dist");
            pdfjs.getDocument = jest.fn().mockReturnValue(mockLoadingTask);
            const result = await converter.convertPdfToImages(mockFilePath, {
                dpi: 150,
                format: "png",
            });
            expect(result.pages).toHaveLength(2);
            expect(result.totalPages).toBe(2);
            expect(result.processingTime).toBeGreaterThan(0);
            expect(result.originalFileSize).toBe(5 * 1024 * 1024);
            expect(mockPage.render).toHaveBeenCalledTimes(2);
            expect(mockCanvas.toBuffer).toHaveBeenCalledWith("image/png");
        });
        it("should handle JPEG format with quality setting", async () => {
            const mockStats = { isFile: () => true, size: 1024 * 1024 };
            fs_1.default.promises.stat.mockResolvedValue(mockStats);
            fs_1.default.promises.readFile.mockResolvedValue(Buffer.from("mock pdf data"));
            const mockCanvas = {
                toBuffer: jest.fn().mockReturnValue(Buffer.from("mock jpeg data")),
            };
            const { createCanvas } = require("canvas");
            createCanvas.mockReturnValue({
                ...mockCanvas,
                getContext: () => ({}),
            });
            const mockPage = {
                getViewport: jest.fn().mockReturnValue({ width: 800, height: 600 }),
                render: jest.fn().mockReturnValue({ promise: Promise.resolve() }),
                cleanup: jest.fn(),
            };
            const mockPdfDocument = {
                numPages: 1,
                getPage: jest.fn().mockResolvedValue(mockPage),
                destroy: jest.fn().mockResolvedValue(undefined),
            };
            const pdfjs = require("pdfjs-dist");
            pdfjs.getDocument = jest.fn().mockReturnValue({
                promise: Promise.resolve(mockPdfDocument),
            });
            await converter.convertPdfToImages(mockFilePath, {
                format: "jpeg",
                quality: 0.8,
            });
            expect(mockCanvas.toBuffer).toHaveBeenCalledWith("image/jpeg", {
                quality: 0.8,
            });
        });
        it("should handle page range conversion", async () => {
            const mockStats = { isFile: () => true, size: 1024 * 1024 };
            fs_1.default.promises.stat.mockResolvedValue(mockStats);
            fs_1.default.promises.readFile.mockResolvedValue(Buffer.from("mock pdf data"));
            const mockCanvas = {
                toBuffer: jest.fn().mockReturnValue(Buffer.from("mock image data")),
            };
            const { createCanvas } = require("canvas");
            createCanvas.mockReturnValue({
                ...mockCanvas,
                getContext: () => ({}),
            });
            const mockPage = {
                getViewport: jest.fn().mockReturnValue({ width: 800, height: 600 }),
                render: jest.fn().mockReturnValue({ promise: Promise.resolve() }),
                cleanup: jest.fn(),
            };
            const mockPdfDocument = {
                numPages: 10,
                getPage: jest.fn().mockResolvedValue(mockPage),
                destroy: jest.fn().mockResolvedValue(undefined),
            };
            const pdfjs = require("pdfjs-dist");
            pdfjs.getDocument = jest.fn().mockReturnValue({
                promise: Promise.resolve(mockPdfDocument),
            });
            const result = await converter.convertPdfToImages(mockFilePath, {
                startPage: 3,
                endPage: 5,
            });
            expect(result.pages).toHaveLength(3); // Pages 3, 4, 5
            expect(mockPdfDocument.getPage).toHaveBeenCalledWith(3);
            expect(mockPdfDocument.getPage).toHaveBeenCalledWith(4);
            expect(mockPdfDocument.getPage).toHaveBeenCalledWith(5);
        });
        it("should throw error for file too large", async () => {
            const mockStats = {
                isFile: () => true,
                size: 150 * 1024 * 1024, // 150MB - exceeds 100MB limit
            };
            fs_1.default.promises.stat.mockResolvedValue(mockStats);
            await expect(converter.convertPdfToImages(mockFilePath)).rejects.toThrow("File too large");
        });
        it("should throw error for unsupported file format", async () => {
            const txtFilePath = "/test/document.txt";
            const mockStats = { isFile: () => true, size: 1024 };
            fs_1.default.promises.stat.mockResolvedValue(mockStats);
            await expect(converter.convertPdfToImages(txtFilePath)).rejects.toThrow("Unsupported file format");
        });
    });
    describe("convertAndSaveImages", () => {
        it("should convert and save images to disk", async () => {
            // Mock file system
            const mockStats = { isFile: () => true, size: 1024 * 1024 };
            fs_1.default.promises.stat.mockResolvedValue(mockStats);
            fs_1.default.promises.readFile.mockResolvedValue(Buffer.from("mock pdf data"));
            fs_1.default.promises.writeFile.mockResolvedValue(undefined);
            fs_1.default.existsSync.mockReturnValue(true);
            // Mock canvas and PDF.js
            const mockCanvas = {
                toBuffer: jest.fn().mockReturnValue(Buffer.from("mock image data")),
            };
            const { createCanvas } = require("canvas");
            createCanvas.mockReturnValue({
                ...mockCanvas,
                getContext: () => ({}),
            });
            const mockPage = {
                getViewport: jest.fn().mockReturnValue({ width: 800, height: 600 }),
                render: jest.fn().mockReturnValue({ promise: Promise.resolve() }),
                cleanup: jest.fn(),
            };
            const mockPdfDocument = {
                numPages: 2,
                getPage: jest.fn().mockResolvedValue(mockPage),
                destroy: jest.fn().mockResolvedValue(undefined),
            };
            const pdfjs = require("pdfjs-dist");
            pdfjs.getDocument = jest.fn().mockReturnValue({
                promise: Promise.resolve(mockPdfDocument),
            });
            const result = await converter.convertAndSaveImages(mockFilePath, mockOutputDir, { filenamePrefix: "test_doc" });
            expect(result.savedFiles).toHaveLength(2);
            expect(result.savedFiles[0]).toContain("test_doc_page_001.png");
            expect(result.savedFiles[1]).toContain("test_doc_page_002.png");
            expect(fs_1.default.promises.writeFile).toHaveBeenCalledTimes(2);
        });
        it("should create output directory if requested", async () => {
            const mockStats = { isFile: () => true, size: 1024 * 1024 };
            fs_1.default.promises.stat.mockResolvedValue(mockStats);
            fs_1.default.promises.readFile.mockResolvedValue(Buffer.from("mock pdf data"));
            fs_1.default.promises.writeFile.mockResolvedValue(undefined);
            fs_1.default.promises.mkdir.mockResolvedValue(undefined);
            fs_1.default.existsSync.mockReturnValue(false);
            const mockCanvas = {
                toBuffer: jest.fn().mockReturnValue(Buffer.from("mock image data")),
            };
            const { createCanvas } = require("canvas");
            createCanvas.mockReturnValue({
                ...mockCanvas,
                getContext: () => ({}),
            });
            const mockPage = {
                getViewport: jest.fn().mockReturnValue({ width: 800, height: 600 }),
                render: jest.fn().mockReturnValue({ promise: Promise.resolve() }),
                cleanup: jest.fn(),
            };
            const mockPdfDocument = {
                numPages: 1,
                getPage: jest.fn().mockResolvedValue(mockPage),
                destroy: jest.fn().mockResolvedValue(undefined),
            };
            const pdfjs = require("pdfjs-dist");
            pdfjs.getDocument = jest.fn().mockReturnValue({
                promise: Promise.resolve(mockPdfDocument),
            });
            await converter.convertAndSaveImages(mockFilePath, mockOutputDir, {
                createOutputDir: true,
            });
            expect(fs_1.default.promises.mkdir).toHaveBeenCalledWith(mockOutputDir, {
                recursive: true,
            });
        });
    });
    describe("convertPagesStreaming", () => {
        it("should convert specific pages only", async () => {
            const mockStats = { isFile: () => true, size: 1024 * 1024 };
            fs_1.default.promises.stat.mockResolvedValue(mockStats);
            fs_1.default.promises.readFile.mockResolvedValue(Buffer.from("mock pdf data"));
            const mockCanvas = {
                toBuffer: jest.fn().mockReturnValue(Buffer.from("mock image data")),
            };
            const { createCanvas } = require("canvas");
            createCanvas.mockReturnValue({
                ...mockCanvas,
                getContext: () => ({}),
            });
            const mockPage = {
                getViewport: jest.fn().mockReturnValue({ width: 800, height: 600 }),
                render: jest.fn().mockReturnValue({ promise: Promise.resolve() }),
                cleanup: jest.fn(),
            };
            const mockPdfDocument = {
                numPages: 10,
                getPage: jest.fn().mockResolvedValue(mockPage),
                destroy: jest.fn().mockResolvedValue(undefined),
            };
            const pdfjs = require("pdfjs-dist");
            pdfjs.getDocument = jest.fn().mockReturnValue({
                promise: Promise.resolve(mockPdfDocument),
            });
            const result = await converter.convertPagesStreaming(mockFilePath, [2, 5, 8]);
            expect(result).toHaveLength(3);
            expect(mockPdfDocument.getPage).toHaveBeenCalledWith(2);
            expect(mockPdfDocument.getPage).toHaveBeenCalledWith(5);
            expect(mockPdfDocument.getPage).toHaveBeenCalledWith(8);
            expect(mockPdfDocument.getPage).not.toHaveBeenCalledWith(1);
        });
        it("should skip invalid page numbers", async () => {
            const mockStats = { isFile: () => true, size: 1024 * 1024 };
            fs_1.default.promises.stat.mockResolvedValue(mockStats);
            fs_1.default.promises.readFile.mockResolvedValue(Buffer.from("mock pdf data"));
            const mockCanvas = {
                toBuffer: jest.fn().mockReturnValue(Buffer.from("mock image data")),
            };
            const { createCanvas } = require("canvas");
            createCanvas.mockReturnValue({
                ...mockCanvas,
                getContext: () => ({}),
            });
            const mockPage = {
                getViewport: jest.fn().mockReturnValue({ width: 800, height: 600 }),
                render: jest.fn().mockReturnValue({ promise: Promise.resolve() }),
                cleanup: jest.fn(),
            };
            const mockPdfDocument = {
                numPages: 5,
                getPage: jest.fn().mockResolvedValue(mockPage),
                destroy: jest.fn().mockResolvedValue(undefined),
            };
            const pdfjs = require("pdfjs-dist");
            pdfjs.getDocument = jest.fn().mockReturnValue({
                promise: Promise.resolve(mockPdfDocument),
            });
            const result = await converter.convertPagesStreaming(mockFilePath, [0, 3, 10] // 0 and 10 are invalid for a 5-page document
            );
            expect(result).toHaveLength(1); // Only page 3 should be converted
            expect(mockPdfDocument.getPage).toHaveBeenCalledWith(3);
            expect(mockPdfDocument.getPage).not.toHaveBeenCalledWith(0);
            expect(mockPdfDocument.getPage).not.toHaveBeenCalledWith(10);
        });
    });
    describe("getOptimalConversionSettings", () => {
        it("should return optimal settings based on PDF characteristics", async () => {
            const mockStats = { isFile: () => true, size: 2 * 1024 * 1024 };
            fs_1.default.promises.stat.mockResolvedValue(mockStats);
            fs_1.default.promises.readFile.mockResolvedValue(Buffer.from("mock pdf data"));
            const mockPage = {
                getViewport: jest.fn().mockReturnValue({ width: 600, height: 800 }),
                cleanup: jest.fn(),
            };
            const mockPdfDocument = {
                numPages: 10,
                getPage: jest.fn().mockResolvedValue(mockPage),
                destroy: jest.fn().mockResolvedValue(undefined),
            };
            const pdfjs = require("pdfjs-dist");
            pdfjs.getDocument = jest.fn().mockReturnValue({
                promise: Promise.resolve(mockPdfDocument),
            });
            const result = await converter.getOptimalConversionSettings(mockFilePath);
            expect(result.recommendedDpi).toBeGreaterThan(0);
            expect(["png", "jpeg"]).toContain(result.recommendedFormat);
            expect(result.estimatedMemoryUsage).toBeGreaterThan(0);
            expect(result.processingTimeEstimate).toBeGreaterThan(0);
        });
    });
});
//# sourceMappingURL=pdfToImageConverter.test.js.map