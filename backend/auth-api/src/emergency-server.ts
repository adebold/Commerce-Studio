import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const port = parseInt(process.env.PORT || '8080', 10);

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'commerce-studio-auth',
    version: '1.0.0-emergency'
  });
});

// Basic customer registration endpoint (mock for now)
app.post('/api/customers/register', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Emergency mode: Customer registration endpoint is available',
    customerId: 'emergency-' + Date.now()
  });
});

// Basic auth endpoints (mock for now)
app.post('/api/auth/login', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Emergency mode: Auth login endpoint is available',
    token: 'emergency-token-' + Date.now()
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Emergency Auth API server running on port ${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${port}/health`);
});