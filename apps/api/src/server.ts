import 'dotenv/config';
import Fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import { getDb, closeDb } from './db/connection.js';
import { healthRoutes } from './routes/health.js';
import { authRoutes } from './routes/auth.js';

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
});

// Register plugins
await fastify.register(fastifyCookie, {
  secret: process.env.SESSION_SECRET || 'change-me-in-production',
});

await fastify.register(fastifyCors, {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
});

// Register routes under /api/v1
await fastify.register(healthRoutes, { prefix: '/api/v1' });
await fastify.register(authRoutes, { prefix: '/api/v1' });

// Initialize database connection
getDb();

// Graceful shutdown
const signals = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
  process.on(signal, async () => {
    console.log(`\nReceived ${signal}, shutting down gracefully...`);
    await fastify.close();
    closeDb();
    process.exit(0);
  });
});

// Start server
try {
  await fastify.listen({ port: PORT, host: HOST });
  console.log(`🚀 API server running at http://${HOST}:${PORT}`);
  console.log(`📚 Health check: http://${HOST}:${PORT}/api/v1/health`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
