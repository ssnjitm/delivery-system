import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";

export const validate =(schema:z.ZodTypeAny)=>
    (req: Request, _res: Response, next: NextFunction)=>{
        try {
            schema.parse({
                body:req.body,
                query:req.query,
                params:req.params
            });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                // Using  ApiError
                const errorMessages = error.issues.map(
                    (err) => `${err.path.join(".")} is ${err.message}`
                );
                
                // Throwing structured error from errorHandler
                throw new ApiError(400, "Validation Error", errorMessages);
            }
            next(error);
        }

}