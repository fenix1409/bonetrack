import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import router from './routes';

dotenv.config();

const app = express();

// Security headers first, so they apply to every response including errors.
app.use(helmet());

/*
 * Native clients (Expo/React Native) do not send an `Origin` header, so they
 * are unaffected by this policy — cors() simply adds no headers and the request
 * proceeds. It exists to constrain the browser/web build.
 *
 * Defaults to `false` (no cross-origin access) rather than `true`, so a missing
 * env var fails closed instead of opening the API to every origin.
 */
const allowedOrigins = process.env.ALLOWED_ORIGINS
   ?.split(',')
   .map((origin) => origin.trim())
   .filter(Boolean);

app.use(
   cors({
      origin: allowedOrigins?.length ? allowedOrigins : false,
      methods: ['GET', 'POST'],
      maxAge: 86_400,
   })
);

app.use(express.json({ limit: '32kb' }));
app.use(router);

// Error handler must be registered last, after every route it should cover.
app.use(
   (
      error: unknown,
      _req: express.Request,
      res: express.Response,
      next: express.NextFunction
   ) => {
      if (!error) {
         next();
         return;
      }

      console.error('Unhandled request error:', error);

      if (res.headersSent) return;
      res.status(400).json({ error: 'Invalid request body.' });
   }
);

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';

const server = app.listen(port, host, () => {
   console.log(`Server is running on http://${host}:${port}`);
});

// Without these, an unhandled rejection can take the process down with no
// explanation in the logs.
process.on('unhandledRejection', (reason) => {
   console.error('Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (error) => {
   console.error('Uncaught exception:', error);
});

const shutdown = (signal: string) => {
   console.log(`${signal} received, closing server.`);
   server.close(() => process.exit(0));
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
