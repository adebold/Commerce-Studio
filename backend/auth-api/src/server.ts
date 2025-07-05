import app from './app.js';
import { config } from './config/index.js';

async function startServer(): Promise<void> {
  try {
    // Start the server
    const server = app.listen(config.port, () => {
      console.log(`🚀 Auth API server running on port ${config.port}`);
      console.log(`📊 Environment: ${config.nodeEnv}`);
      console.log(`🔗 Health check: http://localhost:${config.port}/health`);
      console.log(`🔐 Auth endpoints: http://localhost:${config.port}/api/auth`);
    });

    // Handle server errors
    server.on('error', (error: Error) => {
      console.error('Server error:', error);
      process.exit(1);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);
      
      server.close(async (err) => {
        if (err) {
          console.error('Error during server shutdown:', err);
          process.exit(1);
        }
        
        console.log('Server closed successfully');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();