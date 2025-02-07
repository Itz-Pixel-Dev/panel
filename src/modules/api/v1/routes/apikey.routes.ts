import { Router } from 'express';
import { ApiKeyController } from '../controllers/apikey.controller';
import { authenticateJWT, authorize } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { Request, Response, NextFunction, RequestHandler } from 'express';

const router = Router();

// Wrap async controller methods to handle errors
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
	(req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};

// API Key management routes (admin only)
router.get(
	'/',
	authenticateJWT as RequestHandler,
	authorize('admin') as RequestHandler,
	asyncHandler(ApiKeyController.listKeys)
);

router.post(
	'/',
	authenticateJWT as RequestHandler,
	authorize('admin') as RequestHandler,
	asyncHandler(ApiKeyController.generateKey)
);

router.get(
	'/:id/stats',
	authenticateJWT as RequestHandler,
	authorize('admin') as RequestHandler,
	asyncHandler(ApiKeyController.getKeyStats)
);

router.put(
	'/:id/permissions',
	authenticateJWT as RequestHandler,
	authorize('admin') as RequestHandler,
	asyncHandler(ApiKeyController.updatePermissions)
);

router.delete(
	'/:id',
	authenticateJWT as RequestHandler,
	authorize('admin') as RequestHandler,
	asyncHandler(ApiKeyController.revokeKey)
);

export default router;

