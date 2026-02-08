import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';

export const validateBody = (schema: ZodType<any>) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedData = await schema.parseAsync(req.body);
        req.body = validatedData;
        next();
    } catch (error: any) {
        if (error.errors) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.errors.map((e: any) => ({
                    path: e.path.join('.'),
                    message: e.message
                }))
            });
        }
        return res.status(500).json({ error: 'Internal validation error' });
    }
};
