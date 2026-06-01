import crypto from 'crypto';
import mongoose from 'mongoose';

export const generateOTP = (length: number = 6): string => {
    try {
        let otp = '';
        for (let i = 0; i < length; i++) {
            // Using crypto for better security
            otp += crypto.randomInt(0, 10).toString();
        }
        return otp;
    } catch (error) {
        console.error("OTP generation failed:", error);
        return "123456"; // Emergency fallback
    }
};

//pagination result 
export interface PaginationResult {
    skip: number;
    limit: number;
    page: number;
}

export const paginate = (page: string | number = 1, limit: string | number = 10): PaginationResult => {
    const p = Math.max(1, Number(page));
    const l = Math.max(1, Number(limit));
    const skip = (p - 1) * l;
    return { skip, limit: l, page: p };
};


// formatting date
type DateFormat = 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'ISO';

export const formatDate = (date: Date | string | number, format: DateFormat = 'YYYY-MM-DD'): string => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    switch (format) {
        case 'YYYY-MM-DD': return `${year}-${month}-${day}`;
        case 'DD/MM/YYYY': return `${day}/${month}/${year}`;
        default: return d.toISOString();
    }
};

//safty on email by hiding characters for ui
export const maskEmail = (email: string | undefined | null): string => {
    if (!email) return '';
    const [local, domain] = email.split('@');
    if (!local || !domain) return email;

    // Keep first 2 chars, mask the rest
    const maskedLocal = local.substring(0, 2) + '*'.repeat(Math.max(0, local.length - 2));
    return `${maskedLocal}@${domain}`;
};


//deep clone
export const deepClone = <T>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj));
};



// Safe query parameter parser
export const safeQueryParam = <T>(param: any, defaultValue: T): T => {
    if (!param) return defaultValue;
    if (typeof param === 'string') return param as T;
    if (Array.isArray(param)) return param[0] as T;
    return defaultValue;
};

// Safe string conversion for query params
export const safeString = (param: any, defaultValue: string = ''): string => {
    if (!param) return defaultValue;
    if (typeof param === 'string') return param;
    if (Array.isArray(param)) return param[0] || defaultValue;
    return String(param);
};

// Safe boolean conversion for query params
export const safeBoolean = (param: any, defaultValue: boolean = false): boolean => {
    if (param === undefined || param === null) return defaultValue;
    if (typeof param === 'boolean') return param;
    if (typeof param === 'string') {
        return param.toLowerCase() === 'true' || param === '1';
    }
    return defaultValue;
};

// Safe number conversion for query params
export const safeNumber = (param: any, defaultValue: number = 1): number => {
    if (!param) return defaultValue;
    const num = typeof param === 'string' ? parseInt(param, 10) : Number(param);
    return isNaN(num) ? defaultValue : Math.max(1, num);
};

// Safe ObjectId validation
export const isValidObjectId = (id: string): boolean => {
    return mongoose.Types.ObjectId.isValid(id);
};



// ... your existing helpers

/**
 * Safely get string parameter from request params or query
 */
export const safeParam = (param: string | string[] | undefined, defaultValue: string = ''): string => {
    if (!param) return defaultValue;
    if (typeof param === 'string') return param;
    if (Array.isArray(param) && param.length > 0) return param[0];
    return defaultValue;
};

/**
 * Safely get ID parameter (handles string | string[])
 */
export const safeId = (id: string | string[] | undefined): string => {
    const idStr = safeParam(id);
    if (!idStr) return '';
    return idStr;
};

