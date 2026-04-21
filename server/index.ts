import dotenv from 'dotenv';
import express from 'express';
import router from './routes';

dotenv.config();

const app = express();
app.use(express.json());
app.use(router);

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';

app.listen(port, host, () => {
   console.log(`Server is running on http://${host}:${port}`);
});
