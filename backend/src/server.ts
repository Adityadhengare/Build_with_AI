import { createApp } from './app';
import { env } from './config/env';
import { runSeed } from './seed/seed';
import { dbService } from './services/db';
import { logger } from './utils/logger';

async function bootstrap() {
  const app = createApp();

  // If database has no scholarship records, automatically seed development data
  try {
    const existing = await dbService.getScholarships();
    if (existing.length === 0) {
      logger.info('Scholarship database is empty. Seeding initial verified scholarship catalog...');
      await runSeed();
    }
  } catch (err) {
    logger.warn('Database seed check skipped:', { error: (err as Error).message });
  }

  const server = app.listen(env.PORT, () => {
    logger.info(`ScholarSathi Backend API Server listening on port ${env.PORT} in ${env.NODE_ENV} mode`);
    logger.info(`Health check accessible at http://localhost:${env.PORT}/health`);
    logger.info(`API Base accessible at http://localhost:${env.PORT}${env.API_PREFIX}`);
  });

  // Graceful Shutdown Handling
  const shutdown = (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

if (require.main === module) {
  bootstrap().catch((error) => {
    logger.error('Failed to start server:', { error: (error as Error).message });
    process.exit(1);
  });
}

export { bootstrap };
