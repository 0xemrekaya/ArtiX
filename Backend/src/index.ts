import express from 'express';
import cors from 'cors';
import swapRoutes from './routes/swap';
import { config } from './config';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/swap', swapRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
