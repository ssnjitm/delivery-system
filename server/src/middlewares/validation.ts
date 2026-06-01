import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod';

export const validateBody = (schema: ZodType) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // parseAsync validates and overrides req.body with the stripped/transformed output
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Payload formatting structure failed constraints processing verification.',
          errors: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
        return; 
      }
      
      // Pass unexpected runtime errors to your global Express error handler
      next(error);
    }
  };
};