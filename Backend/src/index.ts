import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { config } from './config';

// Define error interface
interface ApiError extends Error {
  status?: number;
  errors?: string[];
}

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    chain: {
      factoryAddress: config.factoryAddress,
      routerAddress: config.routerAddress,
      wethAddress: config.WETH
    }
  });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    path: req.path
  });
});

// Error handling middleware
app.use((err: ApiError, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  res.status(err.status || 500).json({
    error: err.status === 400 ? 'Bad Request' : 'Internal Server Error',
    message: err.status === 400 || process.env.NODE_ENV === 'development'
      ? err.message
      : 'An unexpected error occurred',
    errors: err.errors,
    timestamp: new Date().toISOString()
  });
});

const PORT = config.port;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Start server
const server = app.listen(PORT, () => {
  console.log(`
    🚀 Server is running!
    🏠 Environment: ${NODE_ENV}
    🔌 Port: ${PORT}
    🔗 Chain Configuration:
       - WETH: ${config.WETH}
       - Router: ${config.routerAddress}
       - Factory: ${config.factoryAddress}
    `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

export default app;
