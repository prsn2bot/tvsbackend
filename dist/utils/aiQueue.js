"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enqueueAIRequest = exports.setAIHandler = void 0;
const queue = [];
let aiHandler = null;
function setAIHandler(handler) {
    aiHandler = handler;
}
exports.setAIHandler = setAIHandler;
function enqueueAIRequest(data) {
    return new Promise((resolve, reject) => {
        queue.push({ data, resolve, reject });
    });
}
exports.enqueueAIRequest = enqueueAIRequest;
setInterval(async () => {
    if (!aiHandler || queue.length === 0)
        return;
    const { data, resolve, reject } = queue.shift();
    try {
        const result = await aiHandler(data);
        resolve(result);
    }
    catch (err) {
        reject(err);
    }
}, 1000); // 1 request per second
//# sourceMappingURL=aiQueue.js.map