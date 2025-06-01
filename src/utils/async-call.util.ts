/**
 * Wrapper function for async/await syntax to avoid wrapping await in try/catch blocks.
 * @param promise The promise we want to await
 * @param errorProps optional custom error object
 */
/**
 * Wraps a promise and returns a standardized result object containing either the resolved value or an error.
 *
 * @template T The type of the resolved value.
 * @param promise - The promise to execute.
 * @param errorProps - Optional properties to assign to the error object if the promise is rejected.
 * @returns A promise that resolves to an object with either `{ error: null, result: T }` if successful,
 * or `{ error: Error, result: null }` if an error occurred.
 */
 export function asyncCall<T>(promise: Promise<T>, errorProps?: Error): Promise<{error: null, result: T} | {error: Error, result: null}> {
    return promise.then((result: T) => {
        return { error: null, result };
    })
    .catch((error: Error) => {
        if (errorProps) 
            Object.assign(error, errorProps);

        return { error, result: null };
    });
};

/**
 * Wrapper function for async/await and Promise.all syntax to avoid wrapping await in try/catch blocks.
 * Can take in any number of promises. Resolves when all promises resolves. 
 * Fails completely if any promise fails.
 * @param promises The promises we want to await
 */
export function multiAsyncCall(...promises: Promise<any>[]): Promise<{error: null, results: any[]} | {error: Error, results: null}>{
    return Promise
    .all(promises)
    .then(results => {
        return { error: null, results};
    })
    .catch((error: Error) => {return { error, results: null}})
}