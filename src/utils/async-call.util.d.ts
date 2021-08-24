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
