import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/errors';
import { config } from '../../shared/config';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      ...(err instanceof Error && 'fields' in err && { fields: (err as any).fields }),
    });
  }

  // Log unexpected errors
  console.error('Unexpected error:', err);

  res.status(500).json({
    error: config.nodeEnv === 'production' ? 'Internal server error' : err.message,
    code: 'INTERNAL_ERROR',
  });
}

