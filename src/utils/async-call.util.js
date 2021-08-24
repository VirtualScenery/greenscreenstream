"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncCall = void 0;
/**
 * Wrapper function for async/await syntax to avoid wrapping await in try/catch blocks.
 * @param promise The promise we want to await
 * @param errorProps optional custom error object
 */
function asyncCall(promise, errorProps) {
    return promise.then((result) => {
        return { error: null, result };
    })
        .catch((error) => {
        if (errorProps)
            Object.assign(error, errorProps);
        return { error, result: null };
    });
}
exports.asyncCall = asyncCall;
;
//# sourceMappingURL=async-call.util.js.map