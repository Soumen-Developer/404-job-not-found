import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import fastifyExpress from '@fastify/express';
import express from 'express';
import { RegisterRoutes } from './generated/routes';
import './workers/adzuna.worker'; // Initialize BullMQ workers
import { initScheduler } from './scheduler';

const server = Fastify({ logger: true });

async function start() {
  try {
    await server.register(cors);
    await server.register(swagger, {
      swagger: {
        info: {
          title: 'CY-Jobs API',
          description: 'API for CY-Jobs Career Intelligence Platform',
          version: '1.0.0'
        }
      }
    });
    await server.register(swaggerUi, {
      routePrefix: '/docs',
    });

    await server.register(fastifyExpress);

    const router = express.Router();
    router.use(express.json());
    router.use(express.urlencoded({ extended: true }));
    RegisterRoutes(router);
    server.use(router);

    server.get('/health', async () => {
      return { status: 'ok' };
    });

    const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`Server running at http://localhost:${port}`);
    
    // Start background cron jobs
    initScheduler();
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
