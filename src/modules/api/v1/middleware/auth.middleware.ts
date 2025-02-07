import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface JWTPayload {
	userId: number;
	email: string;
	isAdmin: boolean;
	sessionId?: string;
}

interface SecurityContext {
	ipAddress: string;
	userAgent: string;
	timestamp: Date;
	requestPath: string;
}

// Advanced rate limiter with IP tracking
export const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    return req.headers['x-forwarded-for']?.toString() || req.ip || 'unknown';
  },
  handler: async (req: Request, res: Response) => {
    const ip = req.headers['x-forwarded-for']?.toString() || req.ip || 'unknown';
    await logSecurityEvent('RATE_LIMIT_EXCEEDED', ip, req.path);
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil(60 - (Date.now() % (60 * 60 * 1000)) / 1000)
    });
  }
});

// Security event logging
async function logSecurityEvent(
  eventType: string,
  ipAddress: string,
  path: string,
  userId?: number
) {
  try {
    await prisma.securityLog.create({
      data: {
        eventType,
        ipAddress,
        path,
        userId,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// Enhanced JWT authentication
export const authenticateJWT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  const securityContext: SecurityContext = {
    ipAddress: req.headers['x-forwarded-for']?.toString() || req.ip || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown',
    timestamp: new Date(),
    requestPath: req.path
  };

  if (!authHeader) {
    await logSecurityEvent('AUTH_HEADER_MISSING', securityContext.ipAddress, req.path);
    res.status(401).json({ error: 'Authorization header missing' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JWTPayload;
		
    const session = await prisma.session.findFirst({
      where: {
        id: decoded.sessionId,
        expires: { gt: new Date() }
      }
    });

    if (!session) {
      await logSecurityEvent('INVALID_SESSION', securityContext.ipAddress, req.path, decoded.userId);
      res.status(401).json({ error: 'Session expired or invalid' });
      return;
    }

    const user = await prisma.users.findUnique({
      where: { id: decoded.userId },
      include: {
        servers: {
          select: { id: true }
        }
      }
    });

    if (!user) {
      await logSecurityEvent('USER_NOT_FOUND', securityContext.ipAddress, req.path);
      res.status(401).json({ error: 'User not found' });
      return;
    }

    if (user.suspended) {
      await logSecurityEvent('SUSPENDED_USER_ACCESS', securityContext.ipAddress, req.path, user.id);
      res.status(403).json({ error: 'Account suspended' });
      return;
    }

    await prisma.users.update({
      where: { id: user.id },
      data: { lastActivity: new Date() }
    });

    req.user = {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      permissions: [],
      servers: user.servers.map(s => s.id),
      securityContext
    };

    next();
  } catch (error) {
    await logSecurityEvent('INVALID_TOKEN', securityContext.ipAddress, req.path);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Enhanced role-based authorization
export const authorize = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const hasRole = roles.includes(req.user.isAdmin ? 'admin' : 'user');
    if (!hasRole) {
      await logSecurityEvent(
        'INSUFFICIENT_PERMISSIONS',
        req.user.securityContext.ipAddress,
        req.path,
        req.user.id
      );
      res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      return;
    }

    next();
  };
};

// Enhanced API key validation
export const validateApiKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const apiKey = req.headers['x-api-key'] as string;
  const ipAddress = req.headers['x-forwarded-for']?.toString() || req.ip || 'unknown';

  if (!apiKey) {
    await logSecurityEvent('API_KEY_MISSING', ipAddress, req.path);
    res.status(401).json({ error: 'API key missing' });
    return;
  }

  try {
    const validKey = await prisma.apiKey.findFirst({
      where: {
        key: apiKey,
        active: true,
        expires: { gt: new Date() }
      }
    });

    if (!validKey) {
      await logSecurityEvent('INVALID_API_KEY', ipAddress, req.path);
      res.status(401).json({ error: 'Invalid API key' });
      return;
    }

    await prisma.apiKey.update({
      where: { id: validKey.id },
      data: {
        lastUsed: new Date(),
        usageCount: { increment: 1 }
      }
    });

    next();
  } catch (error) {
    console.error('API key validation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// IP-based security middleware
export const ipSecurity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const ip = req.headers['x-forwarded-for']?.toString() || req.ip || 'unknown';
	
  try {
    const blockedIP = await prisma.ipBlacklist.findUnique({
      where: { ip }
    });

    if (blockedIP) {
      await logSecurityEvent('BLOCKED_IP_ACCESS', ip, req.path);
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    next();
  } catch (error) {
    console.error('IP security check error:', error);
    next();
  }
};