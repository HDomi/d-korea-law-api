import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import lawRouter from './routes/lawRoutes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Logging middleware for development
if (config.nodeEnv === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Routes
app.use('/api', lawRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    apiOcStatus: config.lawApiOc ? 'CONFIGURED' : 'MISSING (USING MOCK)'
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: 'An internal server error occurred.',
    message: err.message
  });
});

// Start server
app.listen(config.port, () => {
  console.log(`🚀 Server is running on port ${config.port} in ${config.nodeEnv} mode.`);
});

export default app;
