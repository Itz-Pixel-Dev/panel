import { Users, Permission } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        isAdmin: boolean;
        permissions: Permission[];
        servers: number[];
        securityContext: {
          ipAddress: string;
          userAgent: string;
          timestamp: Date;
          requestPath: string;
        };
      };
    }
  }
}

export {};
