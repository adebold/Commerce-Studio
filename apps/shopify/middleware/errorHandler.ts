import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '../utils/logger';

export interface ErrorResponse {
  message: string;
  code?: string;
  details?: unknown;
}

export class ShopifyError extends Error {
  constructor(
    message: string,
    public code: string = 'INTERNAL_ERROR',
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ShopifyError';
  }
}

export const errorHandler = (
  err: Error,
  req: NextApiRequest,
  res: NextApiResponse<ErrorResponse>
) => {
  const isProd = process.env.NODE_ENV === 'production';
  
  if (err instanceof ShopifyError) {
    logger.error('Shopify API Error:', {
      code: err.code,
      message: err.message,
      details: err.details,
      path: req.url
    });

    return res.status(err.statusCode).json({
      message: err.message,
      code: err.code,
      ...(isProd ? {} : { details: err.details })
    });
  }

  // Handle unknown errors
  logger.error('Unhandled Error:', {
    message: err.message,
    stack: isProd ? undefined : err.stack,
    path: req.url
  });

  return res.status(500).json({
    message: isProd ? 'An unexpected error occurred' : err.message,
    code: 'INTERNAL_ERROR',
    ...(isProd ? {} : { details: err.stack })
  });
};

export const withErrorHandler = (
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (err) {
      errorHandler(err as Error, req, res);
    }
  };
};
