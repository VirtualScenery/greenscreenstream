"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multiAsyncCall = exports.asyncCall = void 0;
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
/**
 * Wrapper function for async/await and Promise.all syntax to avoid wrapping await in try/catch blocks.
 * Can take in any number of promises. Resolves when all promises resolves.
 * Fails completely if any promise fails.
 * @param promises The promises we want to await
 */
function multiAsyncCall(...promises) {
    return Promise
        .all(promises)
        .then(results => {
        return { error: null, results };
    })
        .catch((error) => { return { error, results: null }; });
}
exports.multiAsyncCall = multiAsyncCall;
//# sourceMappingURL=async-call.util.js.map