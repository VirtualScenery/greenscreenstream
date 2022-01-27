/**
 * Wrapper function for async/await syntax to avoid wrapping await in try/catch blocks.
 * @param promise The promise we want to await
 * @param errorProps optional custom error object
 */
export declare function asyncCall<T>(promise: Promise<T>, errorProps?: Error): Promise<{
    error: null;
    result: T;
} | {
    error: Error;
    result: null;
}>;
/**
 * Wrapper function for async/await and Promise.all syntax to avoid wrapping await in try/catch blocks.
 * Can take in any number of promises. Resolves when all promises resolves.
 * Fails completely if any promise fails.
 * @param promises The promises we want to await
 */
export declare function multiAsyncCall(...promises: Promise<any>[]): Promise<{
    error: null;
    results: any[];
} | {
    error: Error;
    results: null;
}>;
