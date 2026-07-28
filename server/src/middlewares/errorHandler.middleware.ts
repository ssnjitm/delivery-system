import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import { AppError } from "./auth.js";
import { fail } from "../utils/ApiResponse.js"; 

export function errorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json(fail(err.message));
    }

    if (err instanceof AppError) {
        return res.status(err.statusCode).json(fail(err.message));
    }
    
    console.error("error", err);

    return res.status(500).json(fail("Internal Server Error"));
}