/**
 * Wrapper function for async/await syntax to avoid wrapping await in try/catch blocks.
 * @param promise The promise we want to await
 * @param errorProps optional custom error object
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