import type { NextFunction, Request, Response } from 'express';

type Bucket = {
   count: number;
   resetAt: number;
};

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;
const buckets = new Map<string, Bucket>();

const getClientKey = (req: Request) => req.ip || req.socket.remoteAddress || 'unknown';

export const aiRateLimit = (req: Request, res: Response, next: NextFunction) => {
   const now = Date.now();
   const key = getClientKey(req);
   const bucket = buckets.get(key);

   if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
      next();
      return;
   }

   if (bucket.count >= MAX_REQUESTS) {
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
      return;
   }

   bucket.count += 1;
   next();
};
