import { Request, Response, NextFunction } from 'express';

// Extend Request interface to include dbTimeout
declare global {
  namespace Express {
    interface Request {
      dbTimeout?: number;
    }
  }
}

/**
 * Timeout middleware to prevent long-running requests
 */
export function timeout(ms: number = 30000) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Set timeout for the request
    const timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          error: 'Request timeout',
          message: 'İstek zaman aşımına uğradı. Lütfen daha sonra tekrar deneyin.'
        });
      }
    }, ms);

    // Clear timeout when response is sent
    const originalSend = res.send;
    res.send = function(data: any) {
      clearTimeout(timeoutId);
      return originalSend.call(this, data);
    };

    const originalJson = res.json;
    res.json = function(data: any) {
      clearTimeout(timeoutId);
      return originalJson.call(this, data);
    };

    const originalEnd = res.end;
    res.end = function(data?: any, encoding?: any, cb?: any) {
      clearTimeout(timeoutId);
      return originalEnd.call(this, data, encoding, cb);
    };

    next();
  };
}

/**
 * Database query timeout middleware
 */
export function dbTimeout(ms: number = 15000) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalQuery = req.query;
    
    // Add timeout to any database operations
    req.dbTimeout = ms;
    
    next();
  };
}
