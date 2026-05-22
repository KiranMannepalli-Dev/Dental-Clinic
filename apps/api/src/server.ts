import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: require('path').resolve(__dirname, '../../.env') });
}

import app from './app';
import { prisma } from './config/database';

const PORT = process.env.PORT || 4000;

async function startServer() {
  const server = app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });

  // Verify database connection (non-blocking — server starts regardless)
  prisma.$connect()
    .then(() => console.log('✅ Database connected'))
    .catch((err: Error) => console.warn(`⚠️  Database unavailable: ${err.message}\n   Start PostgreSQL or update DATABASE_URL in apps/api/.env`));

  // Handle graceful shutdown
  const shutdown = async () => {
    console.log('\nShutting down...');
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer();

