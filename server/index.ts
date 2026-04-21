import dotenv from 'dotenv';
import express from 'express';
import router from './routes';

dotenv.config();

const app = express();
app.use(express.json({ limit: '32kb' }));
app.use(router);

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

      res.status(400).json({ error: 'Invalid request body.' });
   }
);

app.use(express.json());
app.use(router);

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';

app.listen(port, host, () => {
   console.log(`Server is running on http://${host}:${port}`);
});
