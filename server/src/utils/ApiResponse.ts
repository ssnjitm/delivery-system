export type ApiResponse<T> = {
    status: 'success' | 'error';
    data: T | null;
    message?: string; 
    meta?: Record<string, unknown>;
    errors?: Array<{ message: string; code?: string }>;
};


// Utility for successful responses

export function ok<T>(
    data: T, 
    message: string = "Success", 
    meta?: Record<string, unknown>
): ApiResponse<T> {
    return {
        status: 'success',
        data,
        message,
        meta
    };
}


// Utility for failed responses (manual overrides)

export function fail<T>(
    message: string, 
    code?: string
): ApiResponse<T> {
    return {
        status: 'error',
        data: null,
        message,
        errors: [{ message, code }]
    };
}