import { Router, Request, Response, NextFunction } from 'express';
import { Module } from '../../../handlers/moduleInit';
import userRoutes from './routes/user.routes';
import serverRoutes from './routes/server.routes';
import nodeRoutes from './routes/node.routes';
import apiKeyRoutes from './routes/apikey.routes';
import { validateApiKey, apiLimiter, ipSecurity } from './middleware/auth.middleware';
import cors from 'cors';
import helmet from 'helmet';
import express from 'express';

const coreModule: Module = {
  info: {
    name: 'API Module',
    description: 'REST API for Airlink Panel',
    version: '1.0.0',
    moduleVersion: '1.0.0',
    author: 'AirLinkLab',
    license: 'MIT',
  },

  router: () => {
    const router = Router();
    const v1Router = Router();

    // Security middleware
    router.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        }
      },
      hidePoweredBy: true,
      noSniff: true,
      referrerPolicy: { policy: 'same-origin' }
    }));

    router.use(cors({
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
      credentials: true,
      maxAge: 86400
    }));

    router.use(express.json({ limit: '1mb' }));
    router.use(express.urlencoded({ extended: true }));
    router.use(apiLimiter);
    router.use(ipSecurity);

    // Mount route handlers
    v1Router.use('/users', userRoutes);
    v1Router.use('/servers', serverRoutes);
    v1Router.use('/nodes', nodeRoutes);
    v1Router.use('/api-keys', apiKeyRoutes);

    // Mount v1 router under /api/v1
    router.use('/api/v1', v1Router);

    // Error handling middleware
    router.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      console.error(err.stack);
      res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
      });
    });

    // 404 handler
    router.use((_req: Request, res: Response) => {
      res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource was not found'
      });
    });

    return router;
  },
};

export default coreModule;

