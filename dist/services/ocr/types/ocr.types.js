"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcrError = void 0;
class OcrError extends Error {
    constructor(message, method, originalError, retryable = true) {
        super(message);
        this.method = method;
        this.originalError = originalError;
        this.retryable = retryable;
        this.name = "OcrError";
    }
}
exports.OcrError = OcrError;
//# sourceMappingURL=ocr.types.js.map