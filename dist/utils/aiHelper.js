"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanContentText = exports.fixBrokenWords = void 0;
function fixBrokenWords(text) {
    // Join words broken by hyphen + newline (e.g. "ex-\nample" -> "example")
    let fixed = text.replace(/(\w)-\n(\w)/g, '$1$2');
    // Join words broken by newline without hyphen (e.g. "ex\nample" -> "example")
    fixed = fixed.replace(/(\w)\n(\w)/g, '$1$2');
    return fixed;
}
exports.fixBrokenWords = fixBrokenWords;
function cleanContentText(text) {
    // Normalize line endings
    let cleaned = text.replace(/\r\n/g, '\n');
    // Replace multiple newlines (2 or more) with exactly 2 newlines (paragraph breaks)
    cleaned = cleaned.replace(/\n{2,}/g, '\n\n');
    // Replace single newlines inside paragraphs with space to avoid breaking words
    cleaned = cleaned.replace(/(?<!\n)\n(?!\n)/g, ' ');
    // Trim spaces at start/end
    cleaned = cleaned.trim();
    return cleaned;
}
exports.cleanContentText = cleanContentText;
//# sourceMappingURL=aiHelper.js.map